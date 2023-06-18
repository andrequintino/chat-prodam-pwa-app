// @ts-ignore
"use client";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import Head from "next/head";
import { Inter } from "next/font/google";
import { useEffect, useState } from "react";

// Import Worker
import { Worker } from "@react-pdf-viewer/core";
// Import the main Viewer component
import { Viewer } from "@react-pdf-viewer/core";
// Import the styles
import "@react-pdf-viewer/core/lib/styles/index.css";
// default layout plugin
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
// Import styles of default layout plugin
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

const Upload: NextPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfFileUpload, setPdfFileUpload] = useState<File | null>(null);
  const [pdfError, setPdfError] = useState("");
  const [saveStatus, setSaveStatus] = useState<string>("");
  const allowedFiles = ["application/pdf"];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSaveStatus("");
    if (event.target.files && event.target.files[0]) {
      let selectedFile = event.target.files[0];
      if (selectedFile) {
        if (selectedFile && allowedFiles.includes(selectedFile.type)) {
          let reader = new FileReader();
          reader.readAsDataURL(selectedFile);
          reader.onloadend = (e: any) => {
            setPdfError("");
            setPdfFile(e.target.result);
          };
          setPdfFileUpload(selectedFile);
        } else {
          setPdfError("Arquivo inválido: Selecione apenas arquivos PDF");
          setPdfFile(null);
        }
      } else {
        setPdfError("please select a PDF");
      }
    }
  };

  const handleSave = async () => {
    if (pdfFileUpload) {
      try {
        setLoading(true);
        setSaveStatus("");
        var formData = new FormData();
        formData.append("media", pdfFileUpload);
        const res = await fetch("/api/saveFile", {
          method: "POST",
          body: formData,
        });

        const {
          data,
          error,
        }: {
          data: {
            message: string;
          } | null;
          error: string | null;
        } = await res.json();

        if (error || !data) {
          setLoading(false);
          alert(error || "Erro ao carregar arquivo.");
          return;
        }
        setLoading(false);
        setSaveStatus(data.message);
      } catch (error: any) {
        setLoading(false);
        console.log(error);
        setSaveStatus("Erro ao carregar arquivo: " + error);
      }
    }
  };

  return (
    <div>
      <Head>
        <title>ChatProdam</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex min-h-screen bg-gpt-gray">
        <section className="flex flex-col w-full">
          <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <h1 className="mb-4 text-2xl font-bold">
              Carregar arquivo para treinar o chatProdam
            </h1>
            <div className="p-4 bg-white rounded-xl shadow h-4/5 w-4/5 text-center">
              <input
                className="px-4 py-2 mb-2 border border-gray-300 rounded w-3/5"
                type="file"
                onChange={handleFileChange}
              />

              <br />
              {pdfError && (
                <span className="text-sm text-red-600 font-bold">
                  {pdfError}
                </span>
              )}
              <br />
              <div className="bg-gray-300 flex justify-center items-center overflow-y-auto mb-2 h-4/5">
                {pdfFile && (
                  <Worker workerUrl="https://unpkg.com/pdfjs-dist@2.12.313/build/pdf.worker.min.js">
                    <Viewer
                      fileUrl={pdfFile}
                      plugins={[defaultLayoutPluginInstance]}
                    ></Viewer>
                  </Worker>
                )}                
              </div>
              {pdfFile && !loading && (
                  <button
                    className="mt-4 px-4 py-2 mb-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
                    onClick={handleSave}
                  >
                    Carregar
                  </button>
                )}
              {loading && (
                <div>
                  <span className="text-lg text-red-500 font-bold">
                    Aguarde, arquivo sendo carregado...
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-row content-between w-4/5 text-left justify-normal p-2 bg-transparent">
              <div className="w-2/6 md:w-1/6">
                <button
                  className="text-blue-600 background-transparent font-bold px-3 py-1 text-xs md:text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                  type="button"
                  onClick={() => router.back()}
                >
                  Voltar para o chat
                </button>
              </div>
              {saveStatus !== "" && (
                <div className="w-3/5 md:w-4/6 text-center">
                  <span className="text-lg text-black font-bold">
                    {saveStatus}
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Upload;
