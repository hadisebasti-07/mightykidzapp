'use server';
/**
 * @fileOverview A Genkit flow that generates a personalized birthday celebration message for a child.
 *
 * - generateBirthdayCelebrationMessage - A function that generates the birthday message.
 * - GenerateBirthdayCelebrationMessageInput - The input type for the generateBirthdayCelebrationMessage function.
 * - GenerateBirthdayCelebrationMessageOutput - The return type for the generateBirthdayCelebrationMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBirthdayCelebrationMessageInputSchema = z.object({
  firstName: z.string().describe('The first name of the child.'),
  nickname: z.string().optional().describe('An optional nickname for the child.'),
});
export type GenerateBirthdayCelebrationMessageInput = z.infer<typeof GenerateBirthdayCelebrationMessageInputSchema>;

const GenerateBirthdayCelebrationMessageOutputSchema = z.object({
  message: z.string().describe('The personalized birthday greeting message.'),
});
export type GenerateBirthdayCelebrationMessageOutput = z.infer<typeof GenerateBirthdayCelebrationMessageOutputSchema>;

export async function generateBirthdayCelebrationMessage(input: GenerateBirthdayCelebrationMessageInput): Promise<GenerateBirthdayCelebrationMessageOutput> {
  return generateBirthdayCelebrationMessageFlow(input);
}

const birthdayCelebrationPrompt = ai.definePrompt({
  name: 'birthdayCelebrationPrompt',
  input: {schema: GenerateBirthdayCelebrationMessageInputSchema},
  output: {schema: GenerateBirthdayCelebrationMessageOutputSchema},
  prompt: `You are a warm and friendly assistant creating a special birthday greeting for a child.
The child's first name is "{{{firstName}}}".
{{#if nickname}}Their nickname is "{{{nickname}}}".{{/if}}

Please generate a short, enthusiastic, and personalized birthday message for them. Make it sound joyful and celebrative!
It should be friendly and welcoming.

Example: "Happy Birthday, [Child's Name]! We're so glad you're here to celebrate with us!"`,
});

const generateBirthdayCelebrationMessageFlow = ai.defineFlow(
  {
    name: 'generateBirthdayCelebrationMessageFlow',
    inputSchema: GenerateBirthdayCelebrationMessageInputSchema,
    outputSchema: GenerateBirthdayCelebrationMessageOutputSchema,
  },
  async (input) => {
    const {output} = await birthdayCelebrationPrompt(input);
    return output!;
  }
);
