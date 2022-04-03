import * as React from "react";
import * as ReactDOM from "react-dom";
import './App.css';
import {LagomGameComponent} from "lagom-engine";
import {LD50} from "./LD50";
import "./Fonts/retro_computer_personal_use.ttf";
import './index.css';

const game = new LD50();

game.load().then(() => {

    const App = () => (
        <div style={{display: "flex", height: "100%", alignItems: "center", justifyContent: "center"}}>
            <LagomGameComponent game={game}/>
            {LD50.debug &&
                <canvas id={"detect-render"} width={"426"} height={"240"}
                        style={{border: "black", borderStyle: "solid"}}/>}
        </div>
    );

    ReactDOM.render(
        <App/>,
        document.getElementById("root"));
});
