'use server';
/**
 * @fileOverview A Genkit flow for generating congratulatory messages when a child redeems a gift.
 *
 * - generateGiftRedemptionMessage - A function that generates a fun and encouraging message for gift redemption.
 * - GenerateGiftRedemptionMessageInput - The input type for the generateGiftRedemptionMessage function.
 * - GenerateGiftRedemptionMessageOutput - The return type for the generateGiftRedemptionMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateGiftRedemptionMessageInputSchema = z.object({
  kidName: z.string().describe("The name of the child who redeemed the gift."),
  giftName: z.string().describe("The name of the gift that was redeemed."),
});
export type GenerateGiftRedemptionMessageInput = z.infer<typeof GenerateGiftRedemptionMessageInputSchema>;

const GenerateGiftRedemptionMessageOutputSchema = z.object({
  message: z.string().describe("A fun, encouraging, and personalized congratulatory message for the child."),
});
export type GenerateGiftRedemptionMessageOutput = z.infer<typeof GenerateGiftRedemptionMessageOutputSchema>;

export async function generateGiftRedemptionMessage(input: GenerateGiftRedemptionMessageInput): Promise<GenerateGiftRedemptionMessageOutput> {
  return generateGiftRedemptionMessageFlow(input);
}

const generateGiftRedemptionMessagePrompt = ai.definePrompt({
  name: 'generateGiftRedemptionMessagePrompt',
  input: {schema: GenerateGiftRedemptionMessageInputSchema},
  output: {schema: GenerateGiftRedemptionMessageOutputSchema},
  prompt: `You are a friendly, enthusiastic, and encouraging character for a children's ministry program.

Generate a fun and personalized congratulatory message for a child named '{{{kidName}}}' who just redeemed a '{{{giftName}}}' with their hard-earned coins.

The message should be short, joyful, and celebrate their achievement in a way that makes them feel special and proud. Use emojis and exciting language!

Example:
"Wow, {{{kidName}}}! You did it! 🎉 You redeemed a super cool {{{giftName}}}! So proud of you! Keep earning those coins! ✨"

Now, generate the message for '{{{kidName}}}' redeeming a '{{{giftName}}}'.`,
});

const generateGiftRedemptionMessageFlow = ai.defineFlow(
  {
    name: 'generateGiftRedemptionMessageFlow',
    inputSchema: GenerateGiftRedemptionMessageInputSchema,
    outputSchema: GenerateGiftRedemptionMessageOutputSchema,
  },
  async (input) => {
    const {output} = await generateGiftRedemptionMessagePrompt(input);
    return output!;
  }
);
