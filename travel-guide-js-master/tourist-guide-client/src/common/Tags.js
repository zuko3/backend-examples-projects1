import React, { useState, useEffect } from "react";
import { envConstants, apiUrls } from "../env.constants";
import { Loader, Error, None } from "../common";
import { Link } from 'react-router-dom';

export function Tags(props) {
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [tags, setTags] = useState([]);
    const { setListTags } = props;

    useEffect(() => {
        const tagsUrls = `${envConstants.BASE_URL}${apiUrls.TAGS_URL}`;
        setIsError(false);
        setIsLoading(true);
        setTags([]);
        fetch(tagsUrls).then(res => {
            if (res.ok) {
                return res.json();
            } else {
                throw new Error('Something went wrong');
            }
        }).then(response => {
            setIsError(false);
            setIsLoading(false);
            setTags(response);
            setListTags(response);
        }).catch(err => {
            setIsError(true);
            setIsLoading(false);
            setTags([]);
        })
    }, []);

    if (isLoading) {
        return (
            <div className="w3-card w3-margin">
                <div className="w3-container w3-padding" style={{ backgroundColor: '#f1f1f1' }}>
                    <h4>Tags</h4>
                </div>
                <div className="w3-container w3-white">
                    <Loader />
                </div>
            </div>
        )
    } else if (isError) {
        return (
            <div className="w3-card w3-margin">
                <div className="w3-container w3-padding" style={{ backgroundColor: '#f1f1f1' }}>
                    <h4>Tags</h4>
                </div>
                <div className="w3-container w3-white">
                    <Error />
                </div>
            </div>
        )
    } else if (tags.length === 0) {
        return (
            <div className="w3-card w3-margin">
                <div className="w3-container w3-padding" style={{ backgroundColor: '#f1f1f1' }}>
                    <h4>Tags</h4>
                </div>
                <div className="w3-container w3-white">
                    <None />
                </div>
            </div>
        )
    } else {
        return (
            <div className="w3-card w3-margin">
                <div className="w3-container w3-padding" style={{ backgroundColor: '#f1f1f1' }}>
                    <h4>Tags</h4>
                </div>
                <div className="w3-container w3-white">
                    <p>
                        {tags.map((tag, index) => <span key={index} style={{ marginRight: '3px' }} className="w3-tag w3-light-grey w3-small w3-margin-bottom">
                            <Link to={`/tags/${tag.tag}`}>{tag.tag}</Link>
                        </span>)}
                    </p>

                </div>
            </div>
        )
    }
}