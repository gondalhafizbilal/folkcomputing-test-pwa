import { FC, ReactElement, useState } from "react";
import "./styles.css";
import { Button, Card, CheckBox, Container } from "../../components";
import { cn } from "../../utils";
import { useNavigate } from "react-router-dom";

type RegisterErrorWithTerms = {
  agreedToTerms: boolean;
};

const Onboarding: FC = (): ReactElement => {
  const navigate = useNavigate();
  const [errors, setErrors] = useState<RegisterErrorWithTerms>({
    agreedToTerms: false,
  });
  const [doesAgreedToTerms, setDoesAgreedToTerms] = useState<boolean>(false);

  const signIn = () => {
    const errorObj = {} as RegisterErrorWithTerms;

    if (!doesAgreedToTerms) {
      errorObj.agreedToTerms = true;
    }

    if (Object.keys(errorObj).length > 0) {
      setErrors({ ...errors, ...errorObj });
      return;
    } else if (localStorage.getItem("USERDATA")) {
      navigate("/chat");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="login-page">
      <Container className="py-20 sm:max-w-md max-sm:p-0">
        <Card className="p-0 overflow-hidden shadow border">
          <div className="p-6 max-sm:px-3">
            <div className="flex justify-center">
              <div className="h-14 w-14 rounded-full bg-[#E11934]" />
            </div>

            <h1 className="text-center text-black text-xl font-semibold my-8">
              folkcomputing
            </h1>
            <h1 className="text-center text-black text-xl font-bold my-8">
              IMPORTANT!
            </h1>

            <h2>
              The folk computing app provides health suggestions but does not
              replace professional medical advice. Consult a healthcare
              professional for personalised guidance. Accuracy may vary, and the
              app is still in development. Use at your own discretion.
            </h2>

            <div className="flex items-center justify-center gap-2 my-10">
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
                className="text-sm  text-black font-medium select-none cursor-pointer"
              >
                I understand
              </label>
            </div>
            <span
              className={cn("min-h-4 block text-xs text-red-700 mt-1 mb-3", {
                invisible: !errors.agreedToTerms,
              })}
            >
              Please accept the Terms and Conditions to continue
            </span>
            <Button type="button" className="w-full" onClick={signIn}>
              Continue
            </Button>
          </div>
        </Card>
      </Container>
    </div>
  );
};

export default Onboarding;
