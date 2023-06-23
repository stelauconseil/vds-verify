'use-strict'

import { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { QrReader } from 'react-qr-reader';
import axios from "axios";
import Viewfinder from "./viewfinder";

const Main: React.FC = () => {
    const [facingMode, setfacingMode] = useState("environment");
    const [showDialog, setShowDialog] = useState(false);
    const [scanData, setScanData] = useState("");
    const [result, setResult] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

    useEffect(() => {
        // const processResult = async () => {
        async function processResult() {
            console.log(`loaded data`, scanData);
            try {
                const b64encodedvds = btoa(scanData);
                const result = await axios.post(`http://localhost:8000/api/v1/decode`, {
                    vds: b64encodedvds,
                });
                const { success, message, vds } = result.data;
                console.log(`success, message, vds`, success, message, vds);
                if (success === true) {
                    setResult(vds)
                    setShowDialog(true);
                } else {
                    throw new Error(message);
                }
            } catch (error: any) {
                console.log(error);
                setResult(error?.message);
                setShowDialog(true);
            }
        };

        if (scanData !== "" && showDialog !== true) {
            processResult();
        }
    }, [scanData, showDialog]);

    return (
        <>
            {console.log("showDialog", showDialog)}
            {showDialog === false && (
                <>
                    <QrReader
                        ViewFinder={Viewfinder}
                        scanDelay={1000}
                        constraints={{ facingMode: facingMode }}
                        onResult={(result: any, error: any) => {
                            // console.log(`result`, result)
                            if (!!result) {
                                console.log(`result`, result);
                                setScanData(result.text);
                                // processResult(scanData?.text);
                                // setShowDialog(true);
                            }
                            else if (!!error) {
                                console.log(`error`, error);
                                // setErrorMessage(error.message);
                            }
                        }}
                        containerStyle={{ width: '300px', margin: '0 auto', marginTop: '10' }}
                    />
                </>
            )}
            {showDialog && (
                <>
                    {(
                        <Modal isOpen={showDialog} ariaHideApp={false}>
                            <div>
                                <div className="dialog-content">
                                    <div className="close">
                                        <button onClick={() => {
                                            // setResult(null);
                                            setErrorMessage(null);
                                            setShowDialog(false);
                                            // setProcessing(false);
                                        }} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center">
                                            <span>Close</span>
                                        </button>
                                    </div>
                                    {!!errorMessage && (
                                        <div className="errorMessage">
                                            <h2>{errorMessage}</h2>
                                        </div>
                                    )}
                                    {!!result && (
                                        <div>
                                            <div className="px-4 sm:px-0">
                                                <h3 className="text-base font-semibold leading-7 text-gray-900">VDS Type</h3>
                                                <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">VDS</p>
                                            </div>
                                            <div className="mt-6 border-t border-gray-100">
                                                <dl className="divide-y divide-gray-100">
                                                    {Object.keys(result['data']).map((key, index) => {
                                                        return (
                                                            <div key={index} className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                                                <dt className="text-sm font-medium leading-6 text-gray-900">{key}</dt>
                                                                <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{result['data'][key]}</dd>
                                                            </div>
                                                        );
                                                    })}
                                                </dl>
                                            </div>
                                            <div className="green">Valid VDS</div>
                                            {Object.keys(result['header']).map((key, index) => {
                                                return (
                                                    <div key={index} className="detail">
                                                        <h6 className="detail-header">{key} :</h6>
                                                        <h6 className="detail-content">{result['header'][key]}</h6>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Modal>)}
                </>)}
        </>
    );
};

export default Main;