import { Redirect } from "expo-router";

// Route behind the "Document" tab, which is `disabled` and never shows it: a deep link here
// lands on the scan screen and offers the document sources (scanner, photo, file).
export default function DocumentRoute() {
    return (
        <Redirect href={{ pathname: "/", params: { scanDocument: Date.now() } }} />
    );
}
