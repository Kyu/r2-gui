import {MouseEventHandler, useRef, useState} from "react";
import { S3Client, ListObjectsV2Command, ListBucketsCommand } from "@aws-sdk/client-s3";

import "./App.css";
import Dropdown from "./Dropdown.tsx";

const CF_REGIONS: string[] = ["auto", "wnam", "enam", "weur", "eeur", "apac"]

function App() {
    const [accessKeyId, setAccessKeyId] = useState("");
    const [secretAccessKey, setSecretAccessKey] = useState("");
    const [accountId, setAccountId] = useState("");
    const [bucketName, setBucketName] = useState("");
    const [region, setRegion] = useState<string>(CF_REGIONS[0]);

    const [authMessage, setAuthMessage] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const client = useRef<S3Client>(null);

    const [a, setA] = useState("Nothing")

    function changeRegion(event: React.ChangeEvent<HTMLSelectElement>) {
        setRegion(event.target.value);
    }

    // Admin Read with all buckets enabled
    // Otherwise specify bucket in endpoint url/bucket-name
    // or not idk
    const listObjectsInBucket = async () => {
        const command = new ListObjectsV2Command({
            Bucket: "event-snap-prod",
            // MaxKeys: 100,  // Limits the number of returned objects
            // Prefix:
            // StartAfter:
        });
        try {

            const data = await client.current.send(command);
            setA(`aa ${data.Name}`);
        } catch (err) {
            setA(`Err listing: ${err} ${bucketName}`);
        }

    };


    async function refreshBuckets(_e: MouseEventHandler<HTMLButtonElement>, throwErr = false) {
        try {
            // @ts-ignore
            /*
             {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET", "POST", "PUT", "DELETE"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3000
  }
             */
            client.current.send(new ListBucketsCommand({})).then((r) => {
                setA(r.$metadata)
            }).catch((err) => {
                setA(err.toString())
            })
            const data = await client.current.send(new ListBucketsCommand({}))
            // console.log(data);
        } catch (err) {
            // data = []
            if (throwErr) {
                throw err;
            }
        }
    }

    async function checkAuthentication() {
        client.current = new S3Client({
            region: "auto",
            credentials: {
                accessKeyId: accessKeyId,
                secretAccessKey: secretAccessKey,
            },
            endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
            forcePathStyle: true,
        });
        setAuthMessage("Case 1")


        try {
            // @ts-ignore
            await refreshBuckets(null, true)
            setIsAuthenticated(true)
            setAuthMessage("Verified")
        } catch (err) {
            // @ts-ignore
            console.error("S3 Client authentication failed:", err.message);
            setIsAuthenticated(false)
            setAuthMessage(`err ${err}`)
        }
        // setAuthMessage("??")
    }

    // @ts-ignore
    return (
        <main className="container">
            <h1>R2 Gui</h1>
            <Dropdown title={"Authentication"}>
                <form
                    className="row"
                    onSubmit={(e) => {
                        e.preventDefault();
                    }}
                >
                    <ul>
                        <li>
                            <input
                                type="password"
                                className="auth-input"
                                onChange={(e) => setAccessKeyId(e.currentTarget.value)}
                                placeholder="Access Key ID"
                            />
                        </li>
                        <li>
                            <input
                                type="password"
                                className="auth-input"
                                onChange={(e) => setSecretAccessKey(e.currentTarget.value)}
                                placeholder="Secret Access Key"
                            />
                        </li>
                        <li>
                            <input
                                className="auth-input"
                                onChange={(e) => setAccountId(e.currentTarget.value)}
                                placeholder="Account ID"
                            />
                        </li>
                        <li>
                            <input
                                className="auth-input"
                                onChange={(e) => setBucketName(e.currentTarget.value)}
                                placeholder="Bucket name"
                            />
                        </li>
                        <li>
                            <label>
                                Region:

                                <select name="selectedRegion" value={region} onChange={changeRegion}>
                                    {CF_REGIONS.map((option, index) => (
                                        <option key={index} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </li>
                        <button onClick={checkAuthentication} type="submit">Verify!</button>
                        <p>{authMessage}</p>
                    </ul>
                </form>
            </Dropdown>
            <br/>
            {isAuthenticated && <Dropdown title={"Bucket Select"}>
                <ul>
                    <li>{a}</li>
                </ul>
                <button onClick={listObjectsInBucket}>Refresh</button>
            </Dropdown>}
            <p>hmm {a}</p>
        </main>
    );
}

export default App;
