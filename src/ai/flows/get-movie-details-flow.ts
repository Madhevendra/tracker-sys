'use server';
/**
 * @fileOverview A flow for getting movie details and a poster.
 *
 * - getMovieDetails - A function that returns movie details and a generated poster.
 * - GetMovieDetailsInput - The input type for the getMovieDetails function.
 * - GetMovieDetailsOutput - The return type for the getMovieDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetMovieDetailsInputSchema = z.object({
  title: z.string().describe('The title of the movie or series, potentially misspelled.'),
});
export type GetMovieDetailsInput = z.infer<typeof GetMovieDetailsInputSchema>;

const MovieDetailsSchema = z.object({
    year: z.string().describe('The release year of the movie or series.'),
    description: z.string().describe('A short, one-sentence description of the movie or series.'),
});

const GetMovieDetailsOutputSchema = z.object({
  title: z.string().describe('The corrected, official title of the movie or series.'),
  year: z.string().describe('The release year of the movie or series.'),
  description: z.string().describe('A short, one-sentence description of the movie or series.'),
  posterDataUri: z.string().describe("A generated movie poster image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type GetMovieDetailsOutput = z.infer<typeof GetMovieDetailsOutputSchema>;

export async function getMovieDetails(input: GetMovieDetailsInput): Promise<GetMovieDetailsOutput> {
  return getMovieDetailsFlow(input);
}

const correctionPrompt = ai.definePrompt({
    name: 'movieTitleCorrectionPrompt',
    input: { schema: GetMovieDetailsInputSchema },
    output: { schema: z.object({ title: z.string() }) },
    prompt: `You are a movie and TV show title correction service.
    
    Given the following user input, provide the corrected, official title for the movie or series.
    
    User Input: "{{title}}"
    `,
});


const detailsPrompt = ai.definePrompt({
    name: 'movieDetailsPrompt',
    input: { schema: z.object({ title: z.string() }) },
    output: { schema: MovieDetailsSchema },
    prompt: `You are a movie and TV show information service.
    
    Provide the following information for the movie or series titled "{{title}}":
    - The release year.
    - A very brief, one-sentence summary.
    `,
});

const getMovieDetailsFlow = ai.defineFlow(
  {
    name: 'getMovieDetailsFlow',
    inputSchema: GetMovieDetailsInputSchema,
    outputSchema: GetMovieDetailsOutputSchema,
  },
  async (input) => {
    // Step 1: Correct the title
    const { output: corrected } = await correctionPrompt(input);
    if (!corrected || !corrected.title) {
        throw new Error('Could not correct the movie title.');
    }
    const correctedTitle = corrected.title;

    // Step 2: Get details using the corrected title
    const { output: details } = await detailsPrompt({ title: correctedTitle });
    if (!details) {
      throw new Error('Could not retrieve movie details.');
    }
    
    // Step 3: Generate poster using corrected title
    const { media } = await ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: `A movie poster for "${correctedTitle}" (${details.year}). ${details.description}. Minimalist, artistic vector style.`,
        config: {
            responseModalities: ['TEXT', 'IMAGE'],
        },
    });

    if (!media.url) {
      throw new Error('Could not generate movie poster.');
    }

    return {
      title: correctedTitle,
      ...details,
      posterDataUri: media.url,
    };
  }
);
