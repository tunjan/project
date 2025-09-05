import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { type Chapter, type OnboardingAnswers } from '@/types';

// 1. Define the validation schema with Zod
const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  instagram: z.string().optional(),
  chapter: z.string().min(1, 'Please select a chapter'),
  veganReason: z
    .string()
    .min(10, 'Please provide a reason (min. 10 characters)'),
  // Keep as string enum to avoid type conflicts with react-hook-form
  abolitionistAlignment: z.enum(['true', 'false'], {
    message: 'Please select an option',
  }),
  customAnswer: z
    .string()
    .min(10, 'Please provide an answer (min. 10 characters)'),
});

// 2. Infer the TypeScript type from the schema
type SignUpFormSchema = z.infer<typeof signUpSchema>;

interface SignUpProps {
  chapters: Chapter[];
  onRegister: (formData: {
    name: string;
    email: string;
    instagram: string;
    chapter: string;
    answers: OnboardingAnswers;
  }) => void;
  onNavigateLogin: () => void;
  defaultChapter?: string;
}

const SignUp: React.FC<SignUpProps> = ({
  chapters,
  onRegister,
  onNavigateLogin,
  defaultChapter,
}) => {
  // 3. Initialize react-hook-form
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SignUpFormSchema>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      chapter: defaultChapter || chapters[0]?.name || '',
    },
    mode: 'onChange', // Change back to onChange to enable real-time validation
  });

  // Helper function to check if a field is valid using react-hook-form state

  // 4. Create a submit handler that receives validated data
  const onSubmit: SubmitHandler<SignUpFormSchema> = (data) => {
    // Restructure the flat form data to match the expected nested structure for onRegister
    onRegister({
      name: data.name,
      email: data.email,
      instagram: data.instagram || '',
      chapter: data.chapter,
      answers: {
        veganReason: data.veganReason,
        abolitionistAlignment: data.abolitionistAlignment === 'true',
        customAnswer: data.customAnswer,
      },
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold tracking-tight text-foreground">
              Join the Movement
            </CardTitle>
            <CardDescription>
              Complete the application below. An organizer from your selected
              chapter will review it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* 5. Connect handleSubmit to the form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* 6. Connect fields with `register` and pass errors */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" {...register('name')} />
                {errors.name?.message && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" {...register('email')} />
                {errors.email?.message && (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram Handle (Optional)</Label>
                <Input id="instagram" {...register('instagram')} />
                {errors.instagram?.message && (
                  <p className="text-sm text-destructive">
                    {errors.instagram.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="chapter">Local Chapter</Label>
                <Select
                  value={watch('chapter')}
                  onValueChange={(value) => setValue('chapter', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a chapter" />
                  </SelectTrigger>
                  <SelectContent>
                    {chapters.map((ch) => (
                      <SelectItem key={ch.name} value={ch.name}>
                        {ch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.chapter?.message && (
                  <p className="text-sm text-destructive">
                    {errors.chapter.message}
                  </p>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="veganReason">Why did you go vegan?</Label>
                <Textarea
                  id="veganReason"
                  rows={3}
                  {...register('veganReason')}
                />
                {errors.veganReason?.message && (
                  <p className="text-sm text-destructive">
                    {errors.veganReason.message}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-bold text-foreground">
                  Are you aligned with our abolitionist values (a consistent
                  anti-oppression stance)?
                </Label>
                <RadioGroup
                  value={watch('abolitionistAlignment')}
                  onValueChange={(value: string) =>
                    setValue('abolitionistAlignment', value as 'true' | 'false')
                  }
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="abolitionist-yes" />
                    <Label
                      htmlFor="abolitionist-yes"
                      className="cursor-pointer"
                    >
                      Yes
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="abolitionist-no" />
                    <Label htmlFor="abolitionist-no" className="cursor-pointer">
                      No / Unsure
                    </Label>
                  </div>
                </RadioGroup>
                {errors.abolitionistAlignment && (
                  <p className="text-sm text-destructive">
                    {errors.abolitionistAlignment.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="customAnswer">
                  How can you best contribute to your local chapter? (e.g.,
                  skills, availability)
                </Label>
                <Textarea
                  id="customAnswer"
                  rows={3}
                  {...register('customAnswer')}
                />
                {errors.customAnswer?.message && (
                  <p className="text-sm text-destructive">
                    {errors.customAnswer.message}
                  </p>
                )}
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={Object.keys(errors).length > 0}
                  className="w-full"
                >
                  Submit Application
                </Button>
              </div>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Button
                  type="button"
                  variant="link"
                  onClick={onNavigateLogin}
                  className="h-auto p-0 font-bold"
                >
                  Log In
                </Button>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignUp;
