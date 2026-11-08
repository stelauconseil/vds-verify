import { Redirect } from "expo-router";

// Route behind the "Document" tab, which is `disabled` and never shows it: a deep link here
// lands on the scan screen and opens the document scanner.
export default function DocumentRoute() {
    return (
        <Redirect href={{ pathname: "/", params: { scanDocument: Date.now() } }} />
    );
}
