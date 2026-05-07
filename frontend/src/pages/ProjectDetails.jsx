import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../api/axios';
import { ArrowLeft, Plus, Users, Layout, ShieldAlert } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const ProjectDetails = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('board'); // 'board' or 'members'

    // Modals
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [showMemberModal, setShowMemberModal] = useState(false);

    // Form states
    const [newTask, setNewTask] = useState({ title: '', description: '', status: 'TODO', due_date: '', assignee: '' });
    const [newMember, setNewMember] = useState({ user_id: '', role: 'MEMBER' });
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const [projRes, tasksRes, usersRes] = await Promise.all([
                axiosInstance.get(`projects/${id}/`),
                axiosInstance.get(`tasks/`),
                axiosInstance.get(`users/`)
            ]);
            setProject(projRes.data);
            setTasks(tasksRes.data.filter(t => t.project === parseInt(id)));
            setAllUsers(usersRes.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching project:', error);
            setLoading(false);
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.post('tasks/', {
                ...newTask,
                project: project.id,
                assignee: newTask.assignee ? parseInt(newTask.assignee) : null
            });
            setShowTaskModal(false);
            setNewTask({ title: '', description: '', status: 'TODO', due_date: '', assignee: '' });
            fetchData();
        } catch (error) {
            console.error('Error creating task:', error);
        }
    };

    const handleStatusChange = async (taskId, newStatus) => {
        try {
            await axiosInstance.patch(`tasks/${taskId}/`, { status: newStatus });
            fetchData();
        } catch (error) {
            console.error('Error updating task status:', error);
        }
    };

    const handleAddMember = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        try {
            await axiosInstance.post(`projects/${id}/members/`, newMember);
            setShowMemberModal(false);
            setNewMember({ user_id: '', role: 'MEMBER' });
            fetchData();
        } catch (error) {
            setErrorMsg(error.response?.data?.detail || 'Failed to add member.');
        }
    };

    const handleRemoveMember = async (userId) => {
        if (!window.confirm("Are you sure you want to remove this member?")) return;
        try {
            await axiosInstance.delete(`projects/${id}/members/`, { data: { user_id: userId } });
            fetchData();
        } catch (error) {
            alert(error.response?.data?.detail || 'Failed to remove member.');
        }
    };

    if (loading) return <div>Loading project...</div>;
    if (!project) return <div>Project not found</div>;

    const myRole = project.members.find(m => m.user.id === user.id)?.role;
    const isAdmin = myRole === 'ADMIN';

    const todoTasks = tasks.filter(t => t.status === 'TODO');
    const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS');
    const doneTasks = tasks.filter(t => t.status === 'DONE');

    return (
        <div className="animate-fade-in">
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '24px' }}>
                <ArrowLeft size={16} /> Back to Dashboard
            </Link>
            
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>{project.name}</h1>
                        <span style={{ fontSize: '0.8rem', background: isAdmin ? 'var(--primary)' : 'rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: '20px' }}>
                            Your Role: {myRole}
                        </span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', maxWidth: '600px' }}>{project.description}</p>
                </div>
            </header>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
                <button className={`btn ${activeTab === 'board' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('board')} style={{ border: 'none' }}>
                    <Layout size={18} /> Kanban Board
                </button>
                <button className={`btn ${activeTab === 'members' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('members')} style={{ border: 'none' }}>
                    <Users size={18} /> Members ({project.members.length})
                </button>
            </div>

            {activeTab === 'board' && (
                <>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                        <button className="btn btn-primary" onClick={() => setShowTaskModal(true)}>
                            <Plus size={20} /> Add Task
                        </button>
                    </div>
                    <div className="kanban-board">
                        <div className="kanban-column">
                            <h3>To Do <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>{todoTasks.length}</span></h3>
                            {todoTasks.map(task => (
                                <div key={task.id} className="task-card">
                                    <h4>{task.title}</h4>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '8px 0' }}>{task.description}</p>
                                    {task.assignee_details && (
                                        <div style={{ fontSize: '0.8rem', color: 'var(--primary)', marginBottom: '8px' }}>
                                            Assigned to: {task.assignee_details.username}
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{task.due_date || 'No due date'}</span>
                                        <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '0.8rem' }} onClick={() => handleStatusChange(task.id, 'IN_PROGRESS')}>Start</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="kanban-column">
                            <h3>In Progress <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>{inProgressTasks.length}</span></h3>
                            {inProgressTasks.map(task => (
                                <div key={task.id} className="task-card">
                                    <h4>{task.title}</h4>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '8px 0' }}>{task.description}</p>
                                    {task.assignee_details && (
                                        <div style={{ fontSize: '0.8rem', color: 'var(--primary)', marginBottom: '8px' }}>
                                            Assigned to: {task.assignee_details.username}
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                                        <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '0.8rem', borderColor: 'var(--danger)', color: 'var(--danger)' }} onClick={() => handleStatusChange(task.id, 'TODO')}>Undo</button>
                                        <button className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '0.8rem', background: 'var(--success)' }} onClick={() => handleStatusChange(task.id, 'DONE')}>Done</button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="kanban-column">
                            <h3>Completed <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>{doneTasks.length}</span></h3>
                            {doneTasks.map(task => (
                                <div key={task.id} className="task-card" style={{ opacity: 0.7 }}>
                                    <h4 style={{ textDecoration: 'line-through' }}>{task.title}</h4>
                                    <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '12px' }}>
                                        <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '0.8rem' }} onClick={() => handleStatusChange(task.id, 'IN_PROGRESS')}>Reopen</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'members' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h2>Project Members</h2>
                        {isAdmin && (
                            <button className="btn btn-primary" onClick={() => setShowMemberModal(true)}>
                                <Plus size={20} /> Add Member
                            </button>
                        )}
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
                        {project.members.map(member => (
                            <div key={member.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>{member.user.username}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{member.user.email}</div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                                    <span style={{ fontSize: '0.8rem', background: member.role === 'ADMIN' ? 'var(--primary)' : 'rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: '20px' }}>
                                        {member.role}
                                    </span>
                                    {isAdmin && member.user.id !== user.id && (
                                        <button onClick={() => handleRemoveMember(member.user.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}>Remove</button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Task Modal */}
            {showTaskModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
                    <div className="glass-panel" style={{ padding: '32px', width: '100%', maxWidth: '500px' }}>
                        <h2 style={{ marginBottom: '24px' }}>Create New Task</h2>
                        <form onSubmit={handleCreateTask}>
                            <div className="input-group">
                                <label>Task Title</label>
                                <input required type="text" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} />
                            </div>
                            <div className="input-group">
                                <label>Description</label>
                                <textarea rows="3" value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})}></textarea>
                            </div>
                            <div className="input-group" style={{ display: 'flex', gap: '16px' }}>
                                <div style={{ flex: 1 }}>
                                    <label>Due Date</label>
                                    <input type="date" value={newTask.due_date} onChange={e => setNewTask({...newTask, due_date: e.target.value})} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label>Assignee</label>
                                    <select value={newTask.assignee} onChange={e => setNewTask({...newTask, assignee: e.target.value})}>
                                        <option value="">Unassigned</option>
                                        {project.members.map(m => (
                                            <option key={m.user.id} value={m.user.id}>{m.user.username}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', marginTop: '24px' }}>
                                <button type="button" className="btn btn-outline" onClick={() => setShowTaskModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Add Task</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Member Modal */}
            {showMemberModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
                    <div className="glass-panel" style={{ padding: '32px', width: '100%', maxWidth: '400px' }}>
                        <h2 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}><ShieldAlert size={24} /> Manage Access</h2>
                        {errorMsg && <div style={{ color: 'var(--danger)', marginBottom: '16px', fontSize: '0.9rem' }}>{errorMsg}</div>}
                        <form onSubmit={handleAddMember}>
                            <div className="input-group">
                                <label>Select User to Invite</label>
                                <select required value={newMember.user_id} onChange={e => setNewMember({...newMember, user_id: e.target.value})}>
                                    <option value="" disabled>Select a user...</option>
                                    {allUsers
                                        .filter(u => !project.members.some(m => m.user.id === u.id)) // filter out current members
                                        .map(u => (
                                        <option key={u.id} value={u.id}>{u.username} ({u.email})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="input-group">
                                <label>Project Role</label>
                                <select required value={newMember.role} onChange={e => setNewMember({...newMember, role: e.target.value})}>
                                    <option value="MEMBER">Member (Can view/edit tasks)</option>
                                    <option value="ADMIN">Admin (Can manage members & delete tasks)</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', marginTop: '24px' }}>
                                <button type="button" className="btn btn-outline" onClick={() => setShowMemberModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Add Member</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectDetails;
