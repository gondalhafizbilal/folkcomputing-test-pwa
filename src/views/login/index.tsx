import { ChangeEvent, FC, ReactElement, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./styles.css";
import Loader from "../../components/loader";
import { Button, Card, CheckBox, Container } from "../../components";
import { cn, isEmailValid } from "../../utils";
import { AUTH_INITIAL_STATE } from "../../constants";
import TextInput from "../../components/inputs/text-input";
import { signInWithEmailAndPassword } from "firebase/auth";

type LoginDt = {
  email: string;
  password: string;
};

type RegisterErrorWithTerms = {
  agreedToTerms: boolean;
  email: string;
  password: string;
};
type LoginProps = {
  app: any;
  auth: any;
};

const Login: FC<LoginProps> = ({ app, auth }): ReactElement => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [data, setData] = useState<LoginDt>(AUTH_INITIAL_STATE);
  const [errors, setErrors] = useState<RegisterErrorWithTerms>({
    ...AUTH_INITIAL_STATE,
    agreedToTerms: false,
  });
  const [doesAgreedToTerms, setDoesAgreedToTerms] = useState<boolean>(false);

  useEffect(() => {
    if (localStorage.getItem("USERDATA")) {
      navigate("/chat");
    }
  }, []);
  const handleForm =
    (type: keyof LoginDt) => (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;

      setData((prevData) => ({
        ...prevData,
        [type]: value,
      }));

      setErrors({ ...errors, ...AUTH_INITIAL_STATE });
    };

  const signIn = () => {
    setLoading(true);
    const errorObj = {} as RegisterErrorWithTerms;

    if (!doesAgreedToTerms) {
      errorObj.agreedToTerms = true;
    }
    if (!data.email.trim()) {
      errorObj.email = "Email is required";
    }
    if (data.email.trim() && !isEmailValid(data.email)) {
      errorObj.email = "Invalid email format.";
    }
    if (!data.password.trim()) {
      errorObj.password = "Password is required.";
    }

    if (Object.keys(errorObj).length > 0) {
      setErrors({ ...errors, ...errorObj });
      setLoading(false);
      return;
    } else {
      login(data);
    }
  };

  const login = async (values: any) => {
    if (values.email && values.password) {
      try {
        const res = await signInWithEmailAndPassword(
          auth,
          values.email,
          values.password
        );
        localStorage.setItem("USERDATA", JSON.stringify(res?.user));
        setLoading(false);
        navigate("/chat");
      } catch (error: any) {
        setLoading(false);
        if (error.code === "auth/invalid-credential") {
          console.log("🚀 ~ Error: Incorrect Email/Password");
          alert("Incorrect Email/Password");
        }
      }
    }
  };

  return (
    <div className="login-page">
      <Container className="py-20 sm:max-w-md max-sm:p-0">
        <Card className="p-6 overflow-hidden shadow border">
          <div className="flex justify-center">
            <div className="h-14 w-14 rounded-full bg-[#E11934]" />
          </div>

          <h1 className="text-center text-black text-xl font-semibold my-8">
            prototypev1
          </h1>
          <h1 className="text-center text-black text-xl font-semibold my-8">
            LOGIN
          </h1>

          <TextInput
            inputType="email"
            placeholder="Email"
            required={false}
            id="email"
            labelClass="mb-4"
            onInvalidMessage="Email"
            inputClass="inputfield mt-6 rounded-3xl "
            onChange={handleForm("email")}
            value={data.email}
            helperText={errors.email}
            error={!!errors.email}
          />

          <TextInput
            inputType="password"
            placeholder="Password"
            required={false}
            id="password"
            labelClass=""
            inputClass="inputfield mt-6 rounded-3xl "
            onInvalidMessage="Password"
            onChange={handleForm("password")}
            value={data.password}
            helperText={errors.password}
            error={!!errors.password}
          />
          <div className="flex items-center gap-2 my-10">
            <CheckBox
              id="conditions"
              selected={doesAgreedToTerms}
              error={errors.agreedToTerms}
              onSelection={(status) => {
                if (status) {
                  setErrors({ ...errors, agreedToTerms: false });
                }
                setDoesAgreedToTerms(status);
              }}
            />
            <label
              htmlFor="conditions"
              className="text-sm text-black font-medium text-start select-none cursor-pointer"
            >
              I accept the privacy policy and terms and conditions
            </label>
          </div>
          <span
            className={cn("min-h-4 block text-xs text-red-700 mt-1 mb-3", {
              invisible: !errors.agreedToTerms,
            })}
          >
            Please accept the Terms and Conditions to continue
          </span>
          <Button type="button" className="w-full mt-10" onClick={signIn}>
            Login
          </Button>
          <Loader loading={loading} />

          <div className="p-7 pt-5 bg-primary-light">
            <p className="text-sm text-black text-center font-medium select-none">
              Register new account
              <Link to="/register">
                <span className="text-primary"> Register</span>
              </Link>
            </p>
          </div>
        </Card>
      </Container>
    </div>
  );
};

export default Login;
