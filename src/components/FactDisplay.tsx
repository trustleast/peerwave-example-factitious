import React, { useState, useEffect } from "react";

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
      window.location.href = redirect;
      return "";
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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [previousFact, setPreviousFact] = useState<string>(baseFact);

  useEffect(() => {
    if (editableFact !== previousFact) {
      setRiffs([]);
      setPreviousFact(editableFact);
    }
  }, [editableFact, previousFact]);

  const handleRiff = (riff: string) => {
    setIsLoading(true);
    getNewSentence(riff)
      .then((newSentence) => {
        if (newSentence === "") {
          return;
        }
        const clean = cleanSentence(newSentence);
        setRiffs((old) => {
          return [...old, clean];
        });
        setError("");
      })
      .catch((newError) => {
        setError(newError.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <>
      {error !== "" && <div className="error-message">{error}</div>}

      <div className="input-container">
        <input
          id="baseFact"
          type="text"
          value={editableFact}
          onChange={(e) => setEditableFact(e.target.value)}
          className="fact-input"
          placeholder="Enter your base fact here..."
        />
        {riffs.length > 0 && <div className="input-connector"></div>}
      </div>

      <div className="fact-chain">
        {riffs.map((riff) => (
          <div key={riff} className="fact-item riff-fact">
            <p className="fact-text">{riff}</p>
          </div>
        ))}
      </div>

      <button
        className="riff-button"
        onClick={() =>
          handleRiff(riffs.length > 0 ? riffs[riffs.length - 1] : editableFact)
        }
        disabled={isLoading}
      >
        {isLoading ? "Generating..." : "Riff"}
      </button>
    </>
  );
};

function cleanSentence(sentence: string): string {
  if (sentence.slice(0, 100).includes(":")) {
    return sentence.split(":", 2)[1];
  }
  return sentence.trim();
}
