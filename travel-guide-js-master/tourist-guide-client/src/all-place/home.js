import React, { useState, useEffect } from "react";
import { envConstants, apiUrls } from "../env.constants";
import { Loader, Error, None } from "../common";
import { PlaceCard } from "../place-card"

export function Home(props) {
    const { tags = [] } = props.authData;
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [place, setPlace] = useState([]);

    useEffect(() => {
        window.scrollTo(0, 0)
        const placeDetailsUrls = new URL(`${envConstants.BASE_URL}${apiUrls.PREFERENCE}`);
        tags.forEach(eachtag => {
            placeDetailsUrls.searchParams.append('tag', eachtag);
        });
        setIsError(false);
        setIsLoading(true);
        setPlace([]);
        fetch(placeDetailsUrls.href).then(res => {
            if (res.ok) {
                return res.json();
            } else {
                throw new Error('Something went wrong');
            }
        }).then(response => {
            setIsError(false);
            setIsLoading(false);
            setPlace(response.places || []);
        }).catch(err => {
            setIsError(true);
            setIsLoading(false);
            setPlace([]);
        })
    }, [tags]);

    if (isLoading) {
        return (
            <React.Fragment>
                <div className="w3-margin">
                    <h4>
                        Showing all results for your preference Tag:
                        {tags.map((eachtag, index) => (
                            <React.Fragment>
                                &nbsp;<span index={index} className="w3-tag">{eachtag}</span>
                            </React.Fragment>
                        ))}
                    </h4>
                </div>
                <Loader />
            </React.Fragment>
        )
    }
    else if (isError) {
        return (
            <React.Fragment>
                <div className="w3-margin">
                    <h4>
                        Showing all results for your preference Tag:
                        {tags.map((eachtag, index) => (
                            <React.Fragment>
                                &nbsp;<span key={index} className="w3-tag">{eachtag}</span>
                            </React.Fragment>
                        ))}
                    </h4>
                </div>
                <Error />
            </React.Fragment>
        )
    } else if (place.length === 0) {
        return (
            <React.Fragment>
                <div className="w3-margin">
                    <h4>
                        Showing all results for your preference Tag:
                        {tags.map((eachtag, index) => (
                            <React.Fragment>
                                &nbsp;<span key={index} className="w3-tag">{eachtag}</span>
                            </React.Fragment>
                        ))}
                    </h4>
                </div>
                <None />
            </React.Fragment>
        )
    } else {

        return (
            <React.Fragment>
                <div className="w3-margin">
                    <h4>
                        Showing all results for your preference Tag:
                        {tags.map((eachtag, index) => (
                            <React.Fragment>
                                &nbsp;<span key={index} className="w3-tag">{eachtag}</span>
                            </React.Fragment>
                        ))}
                    </h4>
                </div>
                {place.map((p, index) => <PlaceCard place={p} key={index} />)}
            </React.Fragment>
        )

    }

}