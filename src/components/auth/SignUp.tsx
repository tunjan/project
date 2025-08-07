import React, { useState } from "react";
import { type OnboardingAnswers, type Chapter } from "@/types";
import { InputField, TextAreaField } from "@/components/ui/Form";

interface SignUpProps {
  chapters: Chapter[];
  onRegister: (formData: {
    name: string;
    instagram: string;
    chapter: string;
    answers: OnboardingAnswers;
  }) => void;
  onNavigateLogin: () => void;
}

const SignUp: React.FC<SignUpProps> = ({
  chapters,
  onRegister,
  onNavigateLogin,
}) => {
  const [name, setName] = useState("");
  const [instagram, setInstagram] = useState("");
  const [chapter, setChapter] = useState(chapters[0]?.name || "");
  const [veganReason, setVeganReason] = useState("");
  const [abolitionistAlignment, setAbolitionistAlignment] = useState(false);
  const [customAnswer, setCustomAnswer] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRegister({
      name,
      instagram,
      chapter,
      answers: { veganReason, abolitionistAlignment, customAnswer },
    });
  };

  return (
    <div className="py-8 md:py-16">
      <div className="max-w-2xl mx-auto bg-white border border-black">
        <div className="p-8 border-b border-black">
          <h1 className="text-3xl font-extrabold text-black">
            Join the Movement
          </h1>
          <p className="mt-2 text-neutral-600">
            Complete the application below. An organizer from your selected
            chapter will review it.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <InputField
            label="Full Name"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <InputField
            label="Instagram Handle (Optional)"
            id="instagram"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            required={false}
          />

          <div>
            <label
              htmlFor="chapter"
              className="block text-sm font-bold text-black mb-1"
            >
              Local Chapter
            </label>
            <select
              id="chapter"
              value={chapter}
              onChange={(e) => setChapter(e.target.value)}
              className="block w-full border border-black bg-white p-2 text-black focus:ring-0 sm:text-sm"
            >
              {chapters.map((ch) => (
                <option key={ch.name} value={ch.name}>
                  {ch.name}
                </option>
              ))}
            </select>
          </div>

          <hr className="border-black" />

          <TextAreaField
            label="Why did you go vegan?"
            id="veganReason"
            value={veganReason}
            onChange={(e) => setVeganReason(e.target.value)}
            rows={3}
          />

          <fieldset>
            <legend className="text-sm font-bold text-black mb-2">
              Are you aligned with our abolitionist values (a consistent
              anti-oppression stance)?
            </legend>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="abolitionist"
                  onChange={() => setAbolitionistAlignment(true)}
                  className="accent-primary"
                />
                <span>Yes</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="abolitionist"
                  defaultChecked
                  onChange={() => setAbolitionistAlignment(false)}
                  className="accent-primary"
                />
                <span>No / Unsure</span>
              </label>
            </div>
          </fieldset>

          <TextAreaField
            label="How can you best contribute to your local chapter? (e.g., skills, availability)"
            id="customAnswer"
            value={customAnswer}
            onChange={(e) => setCustomAnswer(e.target.value)}
            rows={3}
          />

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-primary text-white font-bold py-3 px-4 hover:bg-primary-hover transition-colors duration-300"
            >
              Submit Application
            </button>
          </div>

          <p className="text-center text-sm text-neutral-600">
            Already have an account?{" "}
            <button
              type="button"
              onClick={onNavigateLogin}
              className="font-bold text-primary hover:underline"
            >
              Log In
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
