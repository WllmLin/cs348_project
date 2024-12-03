// src/App.js
import React, { useState, useEffect } from "react";
import TaskList from "./components/TaskList";
import TaskModal from "./components/TaskModal";
import ReportModal from "./components/ReportModal"
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button } from "reactstrap"; // If using Reactstrap

const App = () => {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [reportOpen, setReportOpen] = useState(false)
    const [taskToEdit, setTaskToEdit] = useState(null);
    const [tasks, setTasks] = useState([]); // Initialize tasks state
    const [users, setUsers] = useState([]);

    const openModal = () => {
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
        fetchTasks(); // Refresh task list when closing modal
    };

    const openReport = () => {
        setReportOpen(true);
    };

    const closeReport = () => {
        setReportOpen(false);
        fetchTasks(); // Refresh task list when closing modal
    };

    const fetchTasks = async () => {
        try {
            const response = await axios.get("http://localhost:8000/api/tasks/");
            setTasks(response.data); // Set the fetched tasks in state
        } catch (error) {
            console.error("Error fetching tasks:", error);
        }
    };

    useEffect(() => {
        fetchTasks(); // Fetch tasks when the component mounts
    }, []);

    return (
        <div>
            <button
                type="button"
                className="btn btn-primary me-3"
                onClick={openModal}
            >
                Add Task
            </button>
            <button type="button" className="btn btn-info" onClick={openReport}>
                Generate Report
            </button>
            <TaskList
                tasks={tasks}
                setTaskToEdit={setTaskToEdit}
                fetchTasks={fetchTasks}
                openModal={openModal}
            />
            <TaskModal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                fetchTasks={fetchTasks} // Pass the fetch function to refresh task list
                taskToEdit={taskToEdit}
            />
            <ReportModal
                isOpen={reportOpen}
                onRequestClose={closeReport}
                fetchTasks={fetchTasks} // Pass the fetch function to refresh task list
            />
        </div>
    );
};

export default App;
