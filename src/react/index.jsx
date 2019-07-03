import React from './react';
import ReactDOM from './react-dom';

class Counter extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            num: 0,
        }
    }
    componentWillUpdate() {
        console.log('update');
    }
    componentWillMount() {
        console.log('mount');
    }
    onClick() {
        for (let i = 0; i < 10; i ++) {
            this.setState({num: this.state.num + 1});
            console.log(0);
        }
    }
    render() {
        return (
            <div onClick={() => this.onClick()}>
                <h1>计数君: {this.state.num}</h1>
                <button>计数</button>
            </div>
        )
    }
}

ReactDOM.render(
    <Counter/>,
    document.getElementById('app')
);
