import React, { useState, useEffect } from "react";
import { styled } from "styled-components";

// Define an interface for the quote object
interface Quote {
  quote: string;
  author: string;
}

const QuoteContainer = styled.div`
  position: fixed;
  top: 5%;
  width: 100%;
  text-align: center;
  font-size: larger;
  font-weight: bold;
`;

const RandomQuote: React.FC = () => {
  const [quote, setQuote] = useState<Quote>({ quote: "", author: "" });

  useEffect(() => {
    const quotes: Quote[] = [
      {
        quote: "The way to get started is to quit talking and begin doing.",
        author: "Walt Disney",
      },
      {
        quote: "Life is what happens when you're busy making other plans.",
        author: "John Lennon",
      },
      {
        quote:
          "The world is a book and those who do not travel read only one page.",
        author: "Saint Augustine",
      },
      {
        quote: "Life is either a daring adventure or nothing at all.",
        author: "Helen Keller",
      },
      {
        quote: "To Travel is to Live",
        author: "Hans Christian Andersen",
      },
      {
        quote: "Only a life lived for others is a life worthwhile.",
        author: "Albert Einstein",
      },
      {
        quote: "You only live once, but if you do it right, once is enough.",
        author: "Mae West",
      },
      {
        quote: "Never go on trips with anyone you do not love.",
        author: "Hemmingway",
      },
      {
        quote: "We wander for distraction, but we travel for fulfilment.",
        author: "Hilaire Belloc",
      },
      {
        quote: "Travel expands the mind and fills the gap.",
        author: "Sheda Savage",
      },
    ];

    const generateRandomQuote = () => {
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      setQuote(randomQuote);
    };

    generateRandomQuote();

    const intervalId = setInterval(generateRandomQuote, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <QuoteContainer>
      <span>" {quote.quote} "</span>
      <span> - {quote.author}</span>
    </QuoteContainer>
  );
};

export default RandomQuote;
