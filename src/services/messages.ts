import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  doc,
} from "firebase/firestore";

import { v4 } from "uuid";
import { getUserData } from "../utils";

import axios, { AxiosHeaders } from "axios";

const anthropicAPIKey = process.env.REACT_APP_ANTHROPIC_API_KEY;
const jwtCloudFunctionURL = "https://getjwttoken-fkt6vl2lgq-uc.a.run.app";
const googlecloudAccessTokenURL = "https://oauth2.googleapis.com/token";
const speechToTextURL = "https://speech.googleapis.com/v1/speech:recognize";
const textToSpeechURL =
  "https://texttospeech.googleapis.com/v1/text:synthesize";

let expiryTime = Date.now();
let accessToken: string | null = null;

const serviceUnavailableError = () => {
  alert(
    "Service Unavailable" +
      "Our Services are down at the moment! Please try again after sometime"
  );
};

export const generateGPTResponse = async (lang: string, prompt: any) => {
  try {
    const res = await axios.post(
      `${process.env.REACT_APP_RELAY_SERVER_URL}/api/chat`,
      {
        lang: lang,
        message: prompt,
        apiKey: anthropicAPIKey,
      }
    );
    return {
      success: true,
      msg: res?.data?.msg.content[0].text,
    };
  } catch (err: any) {
    serviceUnavailableError();
    return { success: false, msg: err.message };
  }
};

const getServiceAccountJWTToken = async () => {
  try {
    if (Date.now() < expiryTime) {
      console.log("Cached Access Token is used");
      return accessToken;
    }

    console.log("New Access Token is generated");

    const response = await axios.get(
      `${process.env.REACT_APP_RELAY_SERVER_URL}/api/token?url=${jwtCloudFunctionURL}`
    );

    if (response.data?.token) {
      expiryTime = Date.now() + 3480000;
      accessToken = response.data?.token;
    }

    return response.data?.token || null;
  } catch (error) {
    serviceUnavailableError();
    console.log("getGoogleJWTToken error", error);
  }
};

const getGCPAccessToken = async (jwtToken: string) => {
  try {
    const headers = new AxiosHeaders();
    headers.setContentType("application/x-www-form-urlencoded");
    const response = await axios.post(
      googlecloudAccessTokenURL,
      {
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwtToken,
      },
      { headers }
    );
    return (response?.data?.access_token as string) || null;
  } catch (error) {
    serviceUnavailableError();
    console.log("getGCPAccessToken error", error);
  }
};

export const generateTextFromSpeech = async (
  uri: string | unknown,
  languageCode: string
) => {
  const jwtToken = await getServiceAccountJWTToken();
  if (!jwtToken) {
    serviceUnavailableError();
    return;
  }
  console.log("jwtToken", jwtToken);
  const gcpAccessToken = await getGCPAccessToken(jwtToken);
  if (!gcpAccessToken) {
    serviceUnavailableError();
    return;
  }
  console.log("gcpaccesstoken", gcpAccessToken);
  const params = {
    config: {
      encoding: "mp3",
      sampleRateHertz: 16000,
      languageCode: languageCode,
      enableWordTimeOffsets: false,
    },
    audio: { uri },
  };

  const headers = new AxiosHeaders();
  headers.setAuthorization(`Bearer ${gcpAccessToken}`);
  headers.setContentType("application/json");

  try {
    const res = await axios.post(speechToTextURL, params, { headers });
    return {
      success: true,
      msg: res?.data?.results[0]?.alternatives[0]?.transcript,
    };
  } catch (err: any) {
    serviceUnavailableError();
    return { success: false, msg: err };
  }
};

export const getVoiceFileFromText = async (
  text: string,
  languageCode: string
) => {
  try {
    const jwtToken = await getServiceAccountJWTToken();
    if (!jwtToken) {
      serviceUnavailableError();
      return;
    }

    const gcpAccessToken = await getGCPAccessToken(jwtToken);
    if (!gcpAccessToken) {
      serviceUnavailableError();
      return;
    }

    const headers = new AxiosHeaders();
    headers.setAuthorization(`Bearer ${gcpAccessToken}`);
    headers.setContentType("application/json");

    const params = {
      input: {
        text: text,
      },
      voice: {
        languageCode: languageCode,
        ssmlGender: "FEMALE",
      },
      audioConfig: {
        audioEncoding: "MP3",
      },
    };

    const response = await axios.post(textToSpeechURL, params, { headers });
    const audioContent = response.data?.audioContent || null;

    if (!audioContent) {
      return null;
    }
    const binaryData = atob(audioContent);

    // Convert the binary data to an array buffer
    const arrayBuffer = new ArrayBuffer(binaryData.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < binaryData.length; i++) {
      uint8Array[i] = binaryData.charCodeAt(i);
    }

    // Create a Blob from the array buffer
    const blob = new Blob([uint8Array], { type: "audio/webm" }); // Assuming it's a webm audio

    // Create an object URL for the Blob
    const url: string = URL.createObjectURL(blob);

    // const localSaveFileURL = `${RNFS.CachesDirectoryPath}/${v4()}.mp3`;
    // await RNFS.writeFile(localSaveFileURL, audioContent, 'base64');

    return url;
  } catch (error) {
    console.log("🚀 ~ error:", error);
    serviceUnavailableError();
    return null;
  }
};

export const getUserMessages = async (store: any) => {
  try {
    const user = getUserData();
    const userId = user?.uid;
    const Users = collection(store, "Users");
    const queryString = query(Users, where("userId", "==", userId));
    const res = await getDocs(queryString);
    const userMsgs = res.docs.map((doc) => doc.data());
    if (userMsgs?.length) {
      return userMsgs[0].messages;
    } else {
      const messages = [
        {
          _id: v4(),
          text: "Hi! I'm an AI assistant Aarya! \n How can I help you today?",
          createdAt: new Date(),
          user: {
            _id: "ASSISTENT",
          },
        },
      ];
      await addDoc(Users, {
        userId: userId,
        messages,
      });
      return messages;
    }
  } catch (error) {
    return [];
  }
};

export const translateMessages = async (
  language: string,
  value: string
): Promise<string> => {
  const encodedParams = new URLSearchParams();
  encodedParams.set("from", "auto");
  encodedParams.set("to", language);
  encodedParams.set("text", value);

  const options = {
    method: "POST",
    url: "https://google-translate113.p.rapidapi.com/api/v1/translator/text",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      "X-RapidAPI-Key": process.env.REACT_APP_API_KEY,
      "X-RapidAPI-Host": "google-translate113.p.rapidapi.com",
    },
    data: encodedParams,
  };
  try {
    const { data } = await axios.request(options);
    return data.trans;
  } catch (error) {
    console.log("🚀 ~ error:", error);
    return value;
  }
};
interface Message {
  _id: string;
  text: string;
  createdAt: Date;
  user: {
    _id: string;
  };
}
export const updateMessages = async (
  messages: Message[],
  message: Message[],
  store: any
) => {
  const user = getUserData();
  const userId = user?.uid;
  const data = [...messages, ...message];
  try {
    const Users = collection(store, "Users");
    const q = query(Users, where("userId", "==", userId));
    const userDoc: any = await getDocs(q);
    const frankDocRef = doc(store, "Users", userDoc.docs[0].id);
    await updateDoc(frankDocRef, {
      messages: data,
    });
    return data;
  } catch (error) {
    console.log("🚀 ~ error:", error);
    return messages;
  }
};
