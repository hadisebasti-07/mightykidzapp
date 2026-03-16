'use server';
/**
 * @fileOverview A Genkit flow for generating personalized check-in messages for children.
 *
 * - generatePersonalizedCheckinMessage - A function that generates a personalized welcome message for a child.
 * - GeneratePersonalizedCheckinMessageInput - The input type for the generatePersonalizedCheckinMessage function.
 * - GeneratePersonalizedCheckinMessageOutput - The return type for the generatePersonalizedCheckinMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePersonalizedCheckinMessageInputSchema = z.object({
  kidName: z.string().describe("The name of the child checking in."),
  isBirthday: z.boolean().default(false).describe("Whether it's the child's birthday today."),
  isFirstTimeVisitor: z.boolean().default(false).describe("Whether the child is a first-time visitor."),
  classGroup: z.string().optional().describe("The child's assigned class group, if any.")
});
export type GeneratePersonalizedCheckinMessageInput = z.infer<typeof GeneratePersonalizedCheckinMessageInputSchema>;

const GeneratePersonalizedCheckinMessageOutputSchema = z.string().describe("A personalized, uplifting welcome message.");
export type GeneratePersonalizedCheckinMessageOutput = z.infer<typeof GeneratePersonalizedCheckinMessageOutputSchema>;

export async function generatePersonalizedCheckinMessage(input: GeneratePersonalizedCheckinMessageInput): Promise<GeneratePersonalizedCheckinMessageOutput> {
  return generatePersonalizedCheckinMessageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePersonalizedCheckinMessagePrompt',
  input: {schema: GeneratePersonalizedCheckinMessageInputSchema},
  output: {schema: GeneratePersonalizedCheckinMessageOutputSchema},
  prompt: `You are an AI assistant specialized in creating joyful and uplifting welcome messages for children checking into a church children's ministry program. The message should be short, enthusiastic, and suitable for display with confetti and balloons.

Use the following information to craft a personalized message:
Kid's Name: {{{kidName}}}
Is Birthday: {{{isBirthday}}}
Is First-Time Visitor: {{{isFirstTimeVisitor}}}
{{#if classGroup}}Class Group: {{{classGroup}}}{{/if}}

Create a warm, encouraging, and celebratory welcome message for {{{kidName}}}.

{{#if isBirthday}}Make sure to include a special happy birthday wish!{{/if}}
{{#if isFirstTimeVisitor}}Give a warm welcome for their first visit!{{/if}}

Examples:
- "Welcome back, Lily! So glad to see you!"
- "Happy Birthday, Noah! We're so excited to celebrate with you!"
- "A big, joyful welcome to our new friend, Maya! We're so happy you're here!"
- "Welcome back, David! Get ready for an amazing time in the Kingdom Kids group!"
`,
});

const generatePersonalizedCheckinMessageFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedCheckinMessageFlow',
    inputSchema: GeneratePersonalizedCheckinMessageInputSchema,
    outputSchema: GeneratePersonalizedCheckinMessageOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
