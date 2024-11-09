import { Link } from "react-router-dom";

export default function NotFound(props) {
    return (
        <div>
            <h2>That's a 404.</h2>
            <p>Uh oh, Stinky, Poopy!</p>
            <p>
                <Link to="/">Back to safety.</Link>
            </p>
        </div>
    );
}