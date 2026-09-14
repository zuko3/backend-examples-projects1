import React from "react";
import { envConstants, apiUrls } from "../env.constants";
import { Loader, Error, None } from "../common";
import { PlaceCard } from "../place-card";

export class AllPlaces extends React.Component {
    constructor(props) {
        super();
        this.state = {
            isLoading: false,
            isError: false,
            data: []
        }
    }

    componentDidMount() {
        const placeUrls = `${envConstants.BASE_URL}${apiUrls.ALL_PLACES}`;
        this.setState({ isLoading: true })
        fetch(placeUrls).then(res => {
            if (res.ok) {
                return res.json();
            } else {
                throw new Error('Something went wrong');
            }
        }).then(response => {
            this.setState({
                isLoading: false,
                data: response.places || []
            })
        }).catch(err => {
            this.setState({
                isLoading: false,
                isError: true
            })
        })
    }

    render() {
        const { isLoading, isError, data } = this.state;
        if (isLoading) {
            return <Loader />
        }
        else if (isError) {
            return (
                <Error />
            )
        } else if (data.length === 0) {
            return <None />
        } else {
            return data.map((place, index) => <PlaceCard place={place} key={index} />)
        }
    }

}