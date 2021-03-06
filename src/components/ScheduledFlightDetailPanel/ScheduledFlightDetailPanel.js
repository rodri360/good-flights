import React, {Component} from 'react';
import {Container, Row, Col} from 'reactstrap';
import {connect} from "react-redux";
import OpenWeather from "../../weather/OpenWeather";
import passwd from "../../passwd";
import airports from "../../flightapi/airports";
import planeImg from'../../img/plane.png';
import pinImg from'../../img/pin.png';
import clockImg from'../../img/clock.png';


class ScheduledFlightDetailPanel extends Component {

    constructor(props) {
        super(props);
        this.state = {};
        this.getWeather = this.getWeather.bind(this);
        this.retrieveForecast = this.retrieveForecast.bind(this);

    }

    retrieveForecast(lat, lon, time, callback) {
        let o = new OpenWeather(passwd.openWeatherKey);
        o.forecast(lat, lon, (err, r) => {
            if(err) {
                let message = `ScheduledFlightDetailPanel: error retrieving forecast for (${lat},${lon}) and time '${time}': ${JSON.stringify(err, null,2)}`;
                console.log(message);
                callback(undefined, Error(message));
            }
            else {
                //console.log(`time:${time}`);
                //console.log(`forecast:${JSON.stringify(r.map( a => a.dt),null,2)}`);
                let ret = r.reduce((acc,value) => Math.abs(value.dt - time) < Math.abs(acc.dt - time) ? value : acc);
                //console.log(`result:${JSON.stringify(ret,null,2)}`);
                callback(ret);
            }
        });

    }

    getWeather(props) {
        let _c = this;
        if(props.data && props.data.schedule && props.data.schedule.origin &&
            props.data.schedule.destination) {
            let origin = airports[props.data.schedule.origin];
            this.retrieveForecast(origin.lat, origin.lon, props.data.schedule.filed_departuretime, (or, oe)  => {
                let destination = airports[props.data.schedule.destination];
                this.retrieveForecast(destination.lat, destination.lon, _c.props.data.schedule.estimatedarrivaltime, (dr, de) => {
                   // or dr
                   //console.log(`Origin = ${props.data.schedule.origin} forecast = ${JSON.stringify(or, null,2)}`);
                    _c.setState({destinationWeather: dr, originWeather: or, origin, destination});
                   //console.log(`Destination = ${props.data.schedule.destination} forecast = ${JSON.stringify(dr, null,2)}`);
               });
            });
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.data.schedule && nextProps.data.schedule.origin && nextProps.data.schedule.destination &&
            (!this.props.data || !this.props.data.schedule || !this.props.data.schedule.origin ||
                !this.props.data.schedule.destination ||
                nextProps.data.schedule.origin !== this.props.data.schedule.origin ||
                nextProps.data.schedule.destination !== this.props.data.schedule.destination )) {
                this.getWeather(nextProps);
        }
    }

    componentDidMount() {
        if (this.props.data && this.props.data.schedule && this.props.data.schedule.origin &&
            this.props.data.schedule.destination ) {
            this.getWeather(this.props);
        }
    }

    render() {
        return (
            <Container fluid={true} className="scheduled-flight">
                <Row>
                    <Col xs={12} sm={6} md={2} className="sch-flight-top-info">
                        <span>FLIGHT</span>
                        <span>Variable</span>
                    </Col>
                    <Col xs={12} sm={6} md={3} className="sch-flight-top-info">
                        <img src={planeImg} />
                        <span>CARRIER</span>
                        <span>Variable</span>
                    </Col>
                    <Col xs={12} sm={6} md={3} className="sch-flight-top-info">
                        <img src={clockImg} />
                        <span>DURATION</span>
                        <span>Variable</span>
                    </Col>
                    <Col xs={12} sm={6} md={4} className="sch-flight-top-info">
                        <img src={clockImg} />
                        <span>LIKELINESS OF DELAY</span>
                        <span>Variable</span>
                    </Col>
                    <Col xs={12} md={4}>
                        <div className="squared-container">
                            <span className="squared-container-title">LIKELINESS OF DELAY</span>
                        </div>
                    </Col>
                    <Col xs={12} md={8}>
                        <div className="squared-container">
                            <Row>
                                <Col xs={12} md={6} className="destination-panel">
                                    <div className="destination-panel-top">
                                        <img src={pinImg} />
                                        <span>FROM</span>
                                    </div>
                                </Col>
                                <Col xs={12} md={6} className="destination-panel">
                                    <div className="destination-panel-top">
                                        <img src={pinImg} />
                                        <span>TO</span>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    </Col>
                    <Col xs={12} md={6}>
                        <div className="squared-container">
                            <span className="squared-container-title">FLIGHT STATUS</span>
                        </div>
                    </Col>
                    <Col xs={12} md={6}>
                        <div className="squared-container">
                            <span className="squared-container-title">DELAY BY CARRIERS</span>
                        </div>
                    </Col>
                    <Col xs={12} md={6}>
                        <div className="squared-container">
                            <span className="squared-container-title">CARRIERS</span>
                        </div>
                    </Col>
                    <Col xs={12}>
                        <p>Flight detail: {JSON.stringify(this.props.data.schedule,null,2)}</p>
                        <p>{this.props.data.schedule.origin} Weather: {JSON.stringify(this.state.originWeather,null,2)}</p>
                        <p>{this.props.data.schedule.destination} Weather: {JSON.stringify(this.state.destinationWeather, null, 2)}</p>
                    </Col>
                </Row>

            </Container>

        );
    }

}

function mapDispatchToProps(dispatch) {
    return {};
}


function mapStateToProps(state) {
    return {
        data: state.data
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ScheduledFlightDetailPanel);