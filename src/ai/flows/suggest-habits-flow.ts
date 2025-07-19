'use server';
/**
 * @fileOverview A flow for suggesting new habits.
 *
 * - suggestHabits - A function that returns a list of habit suggestions.
 * - SuggestHabitsInput - The input type for the suggestHabits function.
 * - SuggestHabitsOutput - The return type for the suggestHabits function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestHabitsInputSchema = z.object({
  existingHabits: z.array(z.string()).describe('A list of habits the user is already tracking.'),
});
export type SuggestHabitsInput = z.infer<typeof SuggestHabitsInputSchema>;

const SuggestHabitsOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('A list of 3-5 new habit suggestions.'),
});
export type SuggestHabitsOutput = z.infer<typeof SuggestHabitsOutputSchema>;

export async function suggestHabits(input: SuggestHabitsInput): Promise<SuggestHabitsOutput> {
  return suggestHabitsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestHabitsPrompt',
  input: {schema: SuggestHabitsInputSchema},
  output: {schema: SuggestHabitsOutputSchema},
  prompt: `You are an AI assistant that helps users build better habits.
Your goal is to suggest a few new, actionable, and positive habits.

The user is already tracking the following habits:
{{#if existingHabits}}
{{#each existingHabits}}
- {{this}}
{{/each}}
{{else}}
None. This is a new user!
{{/if}}

Please suggest a list of 3 to 5 new habits they could start.
Make them specific and not too overwhelming. For example, instead of "Exercise", suggest "Go for a 15-minute walk".
Do not suggest any of the habits the user is already tracking.
`,
});

const suggestHabitsFlow = ai.defineFlow(
  {
    name: 'suggestHabitsFlow',
    inputSchema: SuggestHabitsInputSchema,
    outputSchema: SuggestHabitsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
