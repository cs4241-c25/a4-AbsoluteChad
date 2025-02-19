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

    // get initial data when page loads
    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch("/api/all-data")
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

        const response = await fetch("/api/submit", {
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
        setEditingId(rowId)
        setStartTime(rowData.start)
        setEndTime(rowData.end)
        setDetails(rowData.details)

        // uncheck all checkboxes
        const newPractices = { scales: false, etudes: false, technique: false, mainpiece: false }
        if (rowData.practice) {
            rowData.practice.forEach((practice) => {
                newPractices[practice.toLowerCase()] = true
            })
        }

        // check the according checkboxess
        setPractices(newPractices)

        // change submit button to "Update"
        document.querySelector("button#submit").textContent = "Update"
    }

    // update row data
    const updateRow = async (event) => {
        event.preventDefault()
        const json = {
            _id: editingId,
            start: startTime,
            end: endTime,
            details: details,
            practice: []
        }
        
        // process checkboxes
        const checkedPractices = Object.keys(practices).filter((key) => practices[key])
        if (checkedPractices.length > 0) {
            json.practice = checkedPractices
        }
        
        const response = await fetch("/api/edit", {
            method: "POST",
            body: JSON.stringify(json),
        })

        const updatedData = await response.json()
        updateTableRow(updatedData)
    }

    // update row in the table
    const updateTableRow = (updatedData) => {
        // update this row
        setLogs((prevLogs) =>
            prevLogs.map((log) =>
                log._id === updatedData._id ? { ...log, ...updatedData } : log
            )
        )

        // clear all the fields
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

        // change button text back
        document.querySelector("button#submit").textContent = "Submit"
    }

    // delete row
    const deleteRow = async (rowId) => {
        await fetch("/api/delete", {
            method: "POST",
            body: JSON.stringify({ _id: rowId }),
        })
        setLogs((prevLogs) => prevLogs.filter((log) => log._id !== rowId))
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
                        <tr key={log._id}>
                            <td>{new Date(log.start).toLocaleString()}</td>
                            <td>{`${log.hours} hours ${log.minutes} minutes`}</td>
                            <td>{log.practice ? log.practice.join(", ") : ""}</td>
                            <td>{log.details}</td>
                            <td>
                                <button onClick={() => editRow(log._id, log)}>Edit</button>
                                <button onClick={() => deleteRow(log._id)}>Delete</button>
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
