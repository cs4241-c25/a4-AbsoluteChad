import "./Login.css"

function Login() {
    return (
        <div className="loginPage">
            <h1>Instrument Practice Tracker</h1>
            <div className="card">
                <a href="http://localhost:3000/auth/github"><button>Log in with Github</button></a>
                {/* <a href="https://a4-absolutechad-server.glitch.me/auth/github"><button>Log in with Github</button></a> */}
            </div>
        </div>
    );
}

export default Login;
