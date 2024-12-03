// src/components/TaskForm.js
import React, { useState, useEffect } from "react";
import { Form, FormGroup, Label, Input } from "reactstrap";
import axios from "axios";

const TaskForm = ({ task, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        status: "",
        due_date: "",
        assigned_to: "1",
        oncall_team: "meta_verified",
    });

    const [users, setUsers] = useState([]);
    const [teams, setTeams] = useState([]);

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

    const fetchTeams = async () => {
        try {
            const response_teams = await axios.get(
                "http://localhost:8000/api/teams/"
            );
            setTeams(response_teams.data);
        } catch (error) {
            console.error("Error fetching teams:", error);
        }
    };
    useEffect(() => {
        if (task) {
            setFormData({
                title: task.title,
                description: task.description,
                status: task.status,
                due_date: task.due_date.replace("Z", ""),
                assigned_to: task.assigned_to,
                oncall_team: task.oncall_team,
                completion_time: task.completion_time,
            });
        } else {
            setFormData({
                title: "",
                description: "",
                status: "pending",
                due_date: "",
                assigned_to: "1",
                oncall_team: "meta_verified",
            });
            fetchTeams(); // Fetch users when the component mounts
            fetchUsers(); // Fetch users when the component mounts
        }
    }, [task]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        console.log(formData);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData); // Send form data back to the parent
    };

    return (
        <Form onSubmit={handleSubmit}>
            <FormGroup>
                <Label for="title">Title</Label>
                <Input
                    type="text"
                    name="title"
                    id="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                />
            </FormGroup>
            <FormGroup>
                <Label for="description">Description</Label>
                <Input
                    type="textarea"
                    name="description"
                    id="description"
                    value={formData.description}
                    onChange={handleChange}
                />
            </FormGroup>
            <FormGroup>
                <Label for="status">Status</Label>
                <Input
                    type="select"
                    name="status"
                    id="status"
                    value={formData.status}
                    onChange={handleChange}
                >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                </Input>
            </FormGroup>
            <FormGroup>
                <Label for="due_date">Due Date</Label>
                <Input
                    type="datetime-local"
                    name="due_date"
                    id="due_date"
                    value={formData.due_date}
                    onChange={handleChange}
                    required
                />
            </FormGroup>
            <FormGroup>
                <Label for="assigned_to">Assigned To</Label>
                <Input
                    type="select"
                    name="assigned_to"
                    id="assigned_to"
                    value={formData.assigned_to}
                    onChange={handleChange}
                    required
                >
                    {users.map((user) => (
                        <option value={user.id}>
                            {user.name} ({user.email})
                        </option>
                    ))}
                </Input>
            </FormGroup>
            <FormGroup>
                <Label for="oncall_team">Oncall Team</Label>
                <Input
                    type="select"
                    name="oncall_team"
                    id="oncall_team"
                    value={formData.oncall_team}
                    onChange={handleChange}
                >
                    {teams.map((team) => (
                        <option value={team.name}>{team.name}</option>
                    ))}
                </Input>
            </FormGroup>
            <button class="btn btn-primary me-2">Save Task</button>
            <button class="btn btn-secondary" onClick={onCancel}>
                Cancel
            </button>
        </Form>
    );
};

export default TaskForm;
