"use client";
import { hashAPIKey } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [data, setData] = useState("");
  const apiKey = window.localStorage.getItem("apiKey");
  const hashedApiKey = hashAPIKey(`${apiKey}`);
  return (
    <div>
      checkout
      <button
        onClick={() => {
          fetch("/api/checkout", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          })
            .then((res) => res.json())
            .then((data) => {
              console.log(data);
              window.location.href = data.url;
            });
        }}
      >
        here
      </button>
      portal
      <button
        onClick={() => {
          fetch("/api/portal", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": `${hashedApiKey}`,
            },
          })
            .then((res) => res.json())
            .then((data) => {
              console.log(data);
              window.location.href = data.url;
            });
        }}
      >
        here
      </button>
      {apiKey && (
        <>
          api key: {apiKey}{" "}
          <button
            onClick={() => {
              fetch("/api/data", {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  "x-api-key": `${apiKey}`,
                },
              })
                .then((res) => res.json())
                .then((data) => {
                  setData(data);
                });
            }}
          >
            fetch
          </button>
        </>
      )}
      {}
      {data && <pre>{JSON.stringify(data)}</pre>}
    </div>
  );
}
