import React, { useState, useEffect } from "react"
import "./Tracker.css"

function Tracker() {
    const [startTime, setStartTime] = useState("")
    const [endTime, setEndTime] = useState("")
    const [details, setDetails] = useState("")
    const [practices, setPractices] = useState({
        scales: false,
        etudes: false,
        technique: false,
        mainpiece: false,
    })
    const [logs, setLogs] = useState([])
    const [editingId, setEditingId] = useState(null)

    // get initial data on component mount
    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch("http://localhost:3000/api/all-data", {
                method: "GET",
                withCredentials: true,
                headers: {
                    "Content-Type": "application/json"
                }
            })
            const data = await response.json()
            setLogs(data)
        }
        fetchData()
    }, [])

    const handlePracticeChange = (event) => {
        const { name, checked } = event.target
            setPractices((prevPractices) => ({
            ...prevPractices,
            [name]: checked,
        }))
    }

    const handleFormSubmit = async (event) => {
        event.preventDefault()
        const json = {
            start: startTime,
            end: endTime,
            details: details,
        }

        // process checkboxes
        const checkedPractices = Object.keys(practices).filter((key) => practices[key])
        if (checkedPractices.length > 0) {
            json.practice = checkedPractices
        }

        const response = await fetch("http://localhost:3000/api/submit", {
            method: "POST",
            body: JSON.stringify(json),
        })

        const derivedData = await response.json()
        addTableRow(derivedData)
    }

    // add new table row
    const addTableRow = (newData) => {
        setLogs((prevLogs) => [newData, ...prevLogs])
    }

    // edit existing row
    const editRow = (rowId, rowData) => {
        // TODO
    }

    // update row data
    const updateRow = async (event) => {
        // TODO
    }

    // update row in the table
    const updateTableRow = (updatedData) => {
        setLogs((prevLogs) =>
            prevLogs.map((log) =>
                log.ID === updatedData.ID ? { ...log, ...updatedData } : log
            )
        )

        setEditingId(null)
        setStartTime("")
        setEndTime("")
        setDetails("")
        setPractices({
            scales: false,
            etudes: false,
            technique: false,
            mainpiece: false,
        })

        document.querySelector("button#submit").textContent = "Submit"
    }

    // delete row
    const deleteRow = async (rowId) => {
        await fetch("http://localhost:3000/api/delete", {
            method: "POST",
            body: JSON.stringify({ ID: rowId }),
        })

        setLogs((prevLogs) => prevLogs.filter((log) => log.ID !== rowId))
    }

    return (
        <div className="">
            <h1>Add a log</h1>
            <form onSubmit={editingId ? updateRow : handleFormSubmit}>
                <div id="datetime-section">
                    <label htmlFor="startdatetime">When did you start practicing?</label>
                    <input
                        type="datetime-local"
                        id="startdatetime"
                        className="time-entry"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        required
                    />
                    <br />

                    <label htmlFor="enddatetime">When did you end practicing?</label>
                    <input
                        type="datetime-local"
                        id="enddatetime"
                        className="time-entry"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        required
                    />
                    <br />
                </div>

                <div id="practiced-section">
                    <label>What did you practice?</label>
                    <br />
                    {["scales", "etudes", "technique", "mainpiece"].map((practice) => (
                        <div key={practice}>
                            <input
                                type="checkbox"
                                id={practice}
                                className="practice-checkbox"
                                name={practice}
                                checked={practices[practice]}
                                onChange={handlePracticeChange}
                            />
                            <label htmlFor={practice}>
                                {practice.charAt(0).toUpperCase() + practice.slice(1)}
                            </label>
                            <br />
                        </div>
                    ))}
                </div>

                <div id="details-section">
                    <label htmlFor="details">Details:</label>
                    <br />
                    <textarea
                        className="input"
                        id="details"
                        rows="5"
                        cols="50"
                        placeholder="What specifically did you practice today?"
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        required
                    ></textarea>
                    <br />

                    <button type="submit" id="submit">
                        {editingId ? "Update" : "Submit"}
                    </button>
                </div>
            </form>

            <hr />

            <h1>All logs</h1>
            <table>
                <thead>
                    <tr>
                        <th>Practice Date</th>
                        <th>Time practiced</th>
                        <th>Things practiced</th>
                        <th>Details</th>
                        <th>Modify</th>
                    </tr>
                </thead>

                <tbody>
                {logs.map((log) => (
                    <tr key={log.ID}>
                        <td>{new Date(log.start).toLocaleString()}</td>
                        <td>{`${log.hours} hours ${log.minutes} minutes`}</td>
                        <td>{log.practice ? log.practice.join(", ") : ""}</td>
                        <td>{log.details}</td>
                        <td>
                            <button onClick={() => editRow(log.ID, log)}>Edit</button>
                            <button onClick={() => deleteRow(log.ID)}>Delete</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            <div id="logout-section">
                <a href="http://localhost:3000/logout">
                <button>Log Out</button>
                </a>
            </div>
        </div>
    )
}

export default Tracker
