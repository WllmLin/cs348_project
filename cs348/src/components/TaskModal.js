// src/components/TaskModal.js
import React from "react";
import Modal from "react-modal";
import TaskForm from "./TaskForm";
import axios from "axios";
import { ModalHeader, ModalBody } from "reactstrap";

const TaskModal = ({ isOpen, onRequestClose, fetchTasks, taskToEdit }) => {
    const handleTaskSubmit = async (taskData) => {
        try {
            if (taskToEdit) {
                // Update existing task
                await axios.put(
                    `http://localhost:8000/api/tasks/${taskToEdit.id}/`,
                    taskData
                );
            } else {
                // Add new task
                await axios.post("http://localhost:8000/api/tasks/", taskData);
            }
            fetchTasks(); // Refresh the task list after add/edit
            onRequestClose(); // Close the modal after submission
        } catch (error) {
            console.error("Error saving task:", error);
            fetchTasks(); // Refresh the task list after add/edit
            onRequestClose(); // Close the modal after submission
        }
    };

    return (
        <Modal isOpen={isOpen} onRequestClose={onRequestClose}>
            <ModalHeader>{taskToEdit ? "Edit Task" : "Add Task"}</ModalHeader>
            <ModalBody>
                <TaskForm
                    onSubmit={handleTaskSubmit} // Pass the submit handler
                    onCancel={onRequestClose} // Pass the cancel handler
                    task={taskToEdit} // Pass the task to edit
                />
            </ModalBody>
        </Modal>
    );
};

export default TaskModal;
