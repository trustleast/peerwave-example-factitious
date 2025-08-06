"use client";

import { useEffect, useState } from "react";
import { Button } from "./Button";
import { TextContent } from "./TextContent";
import { Stack } from "./Stack";

const factBase = "Generate a random fact like this:";

async function getNewSentence(base: string): Promise<string> {
  const credentials =
    new URLSearchParams(location.hash.substring(1)).get("token") || "";

  const response = await fetch("https://api.peerwave.ai/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Redirect: "/",
      Authorization: credentials,
    },
    body: JSON.stringify({
      model: "cheapest",
      messages: [
        {
          role: "user",
          content: `${factBase} ${base}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const location = response.headers.get("Location");
    if (response.status === 401 && location) {
      console.log("Redirecting to", location);
      window.location.href = location;
    }
    const text = await response.text();
    throw new Error("Couldn't make a new fact: " + text);
  }

  const json = await response.json();
  return json.message.content;
}

function getExistingSentences(): Promise<string[]> {
  const response = fetch("https://dreg2dzhpct39.cloudfront.net/science.json", {
    method: "GET",
  });

  return response.then((response) => {
    if (!response.ok) {
      response.text().then(() => {
        throw new Error("Facts couldn't be fetched! Please reload the page");
      });
      return;
    }

    return response.json();
  });
}

export const FactDisplay = () => {
  const [sentences, setSentences] = useState<string[]>([]);
  const [index, setIndex] = useState<number>(0);
  const [error, setError] = useState<string>("");
  const [riffs, setRiffs] = useState<Record<number, string[]>>({});
  const [processing, setProcessing] = useState<boolean>(false);

  useEffect(() => {
    getExistingSentences()
      .then((sentences) => {
        setSentences(sentences.map(cleanSentence));
        setError("");
      })
      .catch((error) => {
        setError(error.message);
      });
  }, []);

  const handleRiff = () => {
    setProcessing(true);
    const sentence = selectSentence(sentences, index);
    const elementRiffs = riffs[index] || [];
    const base = elementRiffs[elementRiffs.length - 1] || sentence;

    getNewSentence(base)
      .then((sentence) => {
        const clean = cleanSentence(sentence);
        setRiffs((old) => {
          const clone = JSON.parse(JSON.stringify(old));
          const elementRiffs = clone[index] || [];
          elementRiffs.push(clean);
          clone[index] = elementRiffs;

          return clone;
        });
        setError("");
      })
      .catch((error) => {
        setError(error.message);
      })
      .finally(() => {
        setProcessing(false);
      });
  };

  return (
    <>
      {error !== "" && <TextContent color="red">{error}</TextContent>}
      <TextContent>{selectSentence(sentences, index)}</TextContent>
      <div className="gap-medium" />
      <Stack
        direction="row"
        alignItems="center"
        gap="medium"
        justifyContent="center"
      >
        <Button processing={processing} onClick={() => handleRiff()}>
          Riff
        </Button>
        <Button onClick={() => setIndex(index + 1)}>True</Button>
        <Button onClick={() => setIndex(index - 1)}>False</Button>
      </Stack>
      <div className="gap-medium" />
      <Stack gap="medium" direction="column">
        {(riffs[index] || []).map((riff) => {
          return <TextContent key={riff}>{riff}</TextContent>;
        })}
      </Stack>
    </>
  );
};

function cleanSentence(sentence: string): string {
  if (sentence.slice(0, 100).includes(":")) {
    return sentence.split(":", 2)[1];
  }
  return sentence.trim();
}

function selectSentence(sentences: string[], index: number): string {
  return sentences[index % sentences.length];
}
