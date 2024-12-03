// src/components/TaskList.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table } from "reactstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const TaskList = ({ tasks, fetchTasks, setTaskToEdit, openModal }) => {
    const deleteTask = async (id) => {
        try {
            await axios.delete(`http://localhost:8000/api/tasks/${id}/`);
            fetchTasks(); // Refresh the list after deletion
        } catch (error) {
            console.error("Error deleting task:", error);
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
    return (
        <div>
            <Table hover>
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Status</th>
                        <th>Due Date</th>
                        <th>Assigned To</th>
                        <th>Oncall Team</th>
                        <th>Creation Time</th>
                        <th>Actions</th> {/* Add a header for action buttons */}
                    </tr>
                </thead>
                <tbody>
                    {tasks.length === 0 ? ( // Handle empty tasks case
                        <tr>
                            <td colSpan="7" style={{ textAlign: "center" }}>
                                No tasks available
                            </td>
                        </tr>
                    ) : (
                        tasks.map((task) => (
                            <tr key={task.id}>
                                <td>{task.title}</td>
                                <td>{task.status}</td>
                                <td>{task.due_date}</td>
                                <td>
                                    {users.find((user) => user.id === task.assigned_to)?.name ?? ""}
                                </td>
                                <td>{task.oncall_team}</td>
                                <td>{task.creation_time}</td>
                                <td>
                                    <button
                                        type="button"
                                        className="btn btn-secondary me-1"
                                        onClick={() => {
                                            setTaskToEdit(task);
                                            openModal();
                                        }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-danger"
                                        onClick={() => deleteTask(task.id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </Table>
        </div>
    );
};

export default TaskList;
