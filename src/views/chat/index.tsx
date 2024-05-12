import { FC, ReactElement, useEffect, useRef, useState } from "react";
import "./styles.css";
import Loader from "../../components/loader";
import { Card, Container, DropDown } from "../../components";
import { Link, useNavigate } from "react-router-dom";
import {
  generateGPTResponse,
  getUserMessages,
  translateMessages,
  updateMessages,
} from "../../services/messages";
import {
  ArrowRightStartOnRectangleIcon,
  PaperAirplaneIcon,
  MicrophoneIcon,
  StopCircleIcon,
} from "@heroicons/react/16/solid";
import TextInput from "../../components/inputs/text-input";
import { getStorage, ref, uploadBytes } from "firebase/storage";
import {
  generateTextFromSpeech,
  getVoiceFileFromText,
} from "../../services/messages";
import { getUserData } from "../../utils";
import { v4 } from "uuid";

type ChatProps = {
  store: any;
};

const Chat: FC<ChatProps> = ({ store }): ReactElement => {
  const [audioSrc, setAudioSrc] = useState<string>("");
  const [messages, setMessages] = useState<any>([]);
  const [recordingStatus, setRecordingStatus] = useState<boolean>(false);
  const [value, setValue] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [language, setLanguage] = useState<string>("en");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<any>(null);

  useEffect(() => {
    if (!localStorage.getItem("USERDATA")) {
      navigate("/login");
    }
    setLoading(true);
    initializeUserDoc();
  }, []);

  const initializeUserDoc = async () => {
    const defaultMsg =
      "Hi! I'm an AI assistant Aarya! \n How can I help you today?";
    try {
      const data = await getUserMessages(store);
      if (data.length === 1 && data[0].text === defaultMsg) {
        const dt = await getVoiceFileFromText(
          defaultMsg,
          language === "en" ? "en-US" : "bn-BD"
        );
        if (dt) {
          setAudioSrc(dt);
          const audio = new Audio(dt);
          audio.play();
        }
      }
      setMessages(data);
    } catch (error) {
      console.log("🚀 ~ Error: ", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleKeyDown = (e: any) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  const sendMessage = async () => {
    const user = getUserData();
    const userId = user?.uid;
    setLoading(true);
    let message = value;
    try {
      if ("en" !== language) {
        message = await translateMessages(language, value);
      }
      const gptMessage = await generateGPTResponse(language, message);
      const updatedMsgs = await updateMessages(
        messages,
        [
          {
            _id: v4(),
            text: message,
            createdAt: new Date(),
            user: { _id: userId },
          },
          {
            _id: v4(),
            text: gptMessage.msg,
            createdAt: new Date(),
            user: { _id: "ASSISTENT" },
          },
        ],
        store
      );
      const dt = await getVoiceFileFromText(
        gptMessage.msg,
        language === "en" ? "en-US" : "bn-BD"
      );
      setMessages(updatedMsgs);
      setValue("");
      setLoading(false);
      if (dt) {
        setAudioSrc(dt);
        const audio = new Audio(dt);
        audio.play();
      }
    } catch (error) {
      setLoading(false);
      console.log("🚀 ~Error: ", error);
    }
  };

  const getMicrophonePermission = async () => {
    if ("MediaRecorder" in window) {
      try {
        const mediaStream: MediaStream =
          await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: false,
          });
        return mediaStream;
      } catch (err: any) {
        alert(err.message);
        return false;
      }
    } else {
      alert("The MediaRecorder API is not supported in your browser.");
      return false;
    }
  };

  const startRecording = async (activeStream: MediaStream) => {
    setRecordingStatus(true);
    if (activeStream) {
      const media = new MediaRecorder(activeStream, { mimeType: "audio/webm" });
      let localAudioChunks: Blob[] = [];

      media.ondataavailable = (event: any) => {
        if (typeof event.data === "undefined") return;
        if (event.data.size === 0) return;
        localAudioChunks.push(event.data);
      };

      media.onstop = async () => {
        const storage = getStorage();
        const storageRef = ref(storage, v4() + ".mp3");
        const audioBlob = new Blob(localAudioChunks, { type: "audio/webm" });
        const response = await uploadBytes(storageRef, audioBlob);
        const uri = `gs://${response.metadata.bucket}/${response.metadata.fullPath}`;

        try {
          let res = await generateTextFromSpeech(uri, "bn-BD");
          console.log("transalted text: ", res?.msg);
          setValue(res?.msg);
        } catch (error) {
          console.log("🚀 ~Error: ", error);
        }
        setLoading(false);
      };
      mediaRecorder.current = media;

      mediaRecorder.current.start();
    }
  };

  const stopRecording = async () => {
    setLoading(true);
    setRecordingStatus(false);
    if (mediaRecorder !== undefined) {
      mediaRecorder.current?.stop();
    }
  };

  return (
    <Container className=" sm:max-w-md max-sm:p-0 h-screen w-screen">
      <Card className="p-6 overflow-hidden shadoww-full h-full flex flex-col justify-between border relative">
        <div className="flex items-center justify-between">
          <div className="flex flex-grow sm:pt-0 relative">
            <DropDown
              options={[
                { label: "English", value: "en" },
                { label: "Bangla", value: "bn" },
              ]}
              selectValue={async (language) => setLanguage(language)}
              selectedoption={
                [
                  { label: "English", value: "en" },
                  { label: "Bangla", value: "bn" },
                ].find(({ value }) => value === language)?.label ?? ""
              }
              placeholder={"Select language"}
            />
          </div>
          <Link to="/login" onClick={() => localStorage.removeItem("USERDATA")}>
            <div className=" bg-[#E11934] p-2 w-18 h-18 rounded ms-4">
              <ArrowRightStartOnRectangleIcon className="w-8 text-white " />
            </div>
          </Link>
        </div>

        <div className="mt-5 h-full overflow-scroll no-scrollbar">
          {messages?.map((item: any, index: number) => {
            const { user, text } = item;
            return user._id == "ASSISTENT" ? (
              <div key={index} className={`flex justify-start`}>
                <div className="w-4 h-4 bg-[#E11934] rounded-full me-2" />
                <div className="bg-yellow-200 rounded-l-md rounded-tr-md p-3 mb-1">
                  <p className="max-w-40 h-auto text-start ">{text}</p>
                </div>
              </div>
            ) : (
              <div key={index} className={`flex justify-end  h-auto`}>
                <div className="bg-purple-200 rounded-r-md rounded-tl-md p-3 mb-1">
                  <p className="max-w-40 h-auto text-end">{text}</p>
                </div>
                <div className="w-4 h-4 bg-[#e18a19] rounded-full ml-2" />
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className="border rounded-md pe-2 flex items-center justify-between mt-2 bg-gray-100">
          <TextInput
            inputType="text"
            placeholder="Message..."
            required={false}
            id="message"
            labelClass="mb-4"
            onInvalidMessage="Email"
            inputClass="inputfield border-none p-0"
            onChange={(e) => setValue(e.target.value)}
            value={value}
            onKeyDown={handleKeyDown}
          />
          <div className="flex">
            {language === "bn" && (
              <button type="button">
                {recordingStatus ? (
                  <StopCircleIcon
                    type="button"
                    className="w-6 ml-2 text-[#E11934]"
                    onClick={async () => {
                      await stopRecording();
                    }}
                  />
                ) : (
                  <MicrophoneIcon
                    type="button"
                    className="w-6 ml-2 text-[#E11934]"
                    onClick={async () => {
                      try {
                        const mediaStream = await getMicrophonePermission();
                        if (mediaStream && mediaStream.active) {
                          await startRecording(mediaStream);
                        }
                      } catch (error) {}
                    }}
                  />
                )}
              </button>
            )}
            <button disabled={recordingStatus} onClick={sendMessage}>
              <PaperAirplaneIcon
                type="button"
                className="w-6 ml-2 text-[#E11934]"
              />
            </button>
            <audio
              src={audioSrc}
              ref={audioRef}
              autoPlay
              style={{ display: "none" }}
            />
          </div>

          <Loader loading={loading} />
        </div>
      </Card>
    </Container>
  );
};

export default Chat;
