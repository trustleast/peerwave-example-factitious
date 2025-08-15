import React, { useState } from "react";

const factBase = "Generate a random fact like this:";
const baseFact = "Koalas are mammals";

async function getNewSentence(base: string): Promise<string> {
  const credentials =
    new URLSearchParams(window.location.hash.substring(1)).get("token") || "";

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
    const redirect = response.headers.get("Location");
    if (response.status === 402 && redirect) {
      console.log("Redirecting to", redirect);
      window.location.href = redirect;
    }
    const text = await response.text();
    throw new Error("Couldn't make a new fact: " + text);
  }

  const json = await response.json();
  return json.message.content;
}

export const FactDisplay = () => {
  const [error, setError] = useState<string>("");
  const [riffs, setRiffs] = useState<string[]>([]);
  const [editableFact, setEditableFact] = useState<string>(baseFact);

  const handleRiff = (riff: string) => {
    getNewSentence(riff)
      .then((newSentence) => {
        const clean = cleanSentence(newSentence);
        setRiffs((old) => {
          return [...old, clean];
        });
        setError("");
      })
      .catch((newError) => {
        setError(newError.message);
      });
  };

  return (
    <>
      {error !== "" && <p style={{ color: "red" }}>{error}</p>}
      <div>
        <label htmlFor="baseFact">Base Fact:</label>
        <input
          id="baseFact"
          type="text"
          value={editableFact}
          onChange={(e) => setEditableFact(e.target.value)}
          style={{ width: "100%", marginBottom: "10px", padding: "5px" }}
        />
      </div>
      <p>{editableFact}</p>
      <div className="gap-medium" />

      <button
        onClick={() =>
          handleRiff(riffs.length > 0 ? riffs[riffs.length - 1] : editableFact)
        }
      >
        Riff
      </button>
      <div className="gap-medium" />
      <div>
        {riffs.map((riff) => {
          return <p key={riff}>{riff}</p>;
        })}
      </div>
    </>
  );
};

function cleanSentence(sentence: string): string {
  if (sentence.slice(0, 100).includes(":")) {
    return sentence.split(":", 2)[1];
  }
  return sentence.trim();
}
