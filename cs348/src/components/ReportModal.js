// src/components/ReportModal.js
import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { Button, Table, Input  } from "reactstrap";
import axios from "axios";
import { ModalHeader, ModalBody } from "reactstrap";

const ReportModal = ({ isOpen, onRequestClose, fetchTasks}) => {
    const [tasks, setTasks] = useState([]);
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState(""); // Track which filter is active
    const [selectedDate, setSelectedDate] = useState(""); // Track the selected date

    // Function to fetch tasks by status
    const fetchTasksByStatus = async (status) => {
        setLoading(true);
        setStatusFilter(status); // Set the filter status
        try {
            const response = await axios.get(
                `http://localhost:8000/api/tasks/${status}/`
            );
            setTasks(response.data);
            const stats_response = await axios.get(
                `http://localhost:8000/api/tasks/${status}/stats/`
            );
            setStats(stats_response.data);
        } catch (error) {
            console.error("Error fetching tasks by status:", error);
        } finally {
            setLoading(false);
        }
    };

    const [users, setUsers] = useState([]);
    const fetchUsers = async () => {
        try {
            const response_users = await axios.get(
                "http://localhost:8000/api/users/"
            );
            setUsers(response_users.data);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };
    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
    };

    return (
        <Modal isOpen={isOpen} toggle={onRequestClose} onRequestClose={onRequestClose}>
            <ModalHeader><h3>Task Report</h3>
                <Button
                    className="ms-auto btn-lg"
                    color="white"
                    onClick={onRequestClose}
                    style={{ position: 'absolute', right: '10px', top: '10px' }}
                >
                    &times;
                </Button></ModalHeader>
            <ModalBody>
                <div>
                    <Button
                        color="primary"
                        onClick={() => fetchTasksByStatus("in_progress")}
                        className="me-3"
                    >
                        In-Progress Tasks
                    </Button>
                    <Button
                        color="success"
                        onClick={() => fetchTasksByStatus("completed")}
                        className="me-3"
                    >
                        Completed Tasks
                    </Button>
                    <Button
                        color="warning"
                        onClick={() => fetchTasksByStatus("pending")}
                        className="me-3"
                    >
                        Pending Tasks
                    </Button>
                    <Button
                        color="danger"
                        onClick={() => fetchTasksByStatus("overdue")}
                        className="me-3"
                    >
                        Overdue Tasks
                    </Button>
                    <Input
                        type="datetime-local"
                        value={selectedDate}
                        onChange={handleDateChange}
                        style={{ marginBottom: '5px' }}
                    />
                    <Button
                        color="danger"
                        onClick={() => fetchTasksByStatus(`before-date/?date=${selectedDate}:00Z`)}
                        className="me-3"
                    >
                        Incomplete Tasks due before Date
                    </Button>
                </div>

                {loading && <div>Loading...</div>}

                {!loading && tasks.length === 0 && (
                    <div>No tasks found for this status</div>
                )}

                {!loading && tasks.length > 0 && (
                    <div>
                        <p class="fs-4 text-center">{statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Tasks</p>
                        <div>
                        <h5>Task Statistics</h5>
                            {Object.entries(stats).map(([key, value]) => (
                            <p>
                            {key.replace(/_/g, " ").toUpperCase()}: {value}
                            </p>
                            ))}
                        </div>
                        <Table striped>
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Status</th>
                                    <th>Due Date</th>
                                    <th>Assigned To</th>
                                    <th>Oncall Team</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tasks.map((task) => (
                                    <tr key={task.id}>
                                        <td>{task.title}</td>
                                        <td>{task.status}</td>
                                        <td>{task.due_date}</td>
                                        <td>{users.find((user) => user.id === task.assigned_to)?.name ?? ""}</td>
                                        <td>{task.oncall_team}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                )}
            </ModalBody>
        </Modal>
    );
};

export default ReportModal;