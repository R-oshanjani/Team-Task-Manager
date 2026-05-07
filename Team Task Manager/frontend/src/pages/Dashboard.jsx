import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axios';
import { Link } from 'react-router-dom';
import { CheckCircle, Clock, CheckSquare, Plus } from 'lucide-react';

const Dashboard = () => {
    const [summary, setSummary] = useState({ total: 0, todo: 0, in_progress: 0, done: 0 });
    const [projects, setProjects] = useState([]);
    const [myTasks, setMyTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showProjectModal, setShowProjectModal] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [newProjectDesc, setNewProjectDesc] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [dashRes, projRes] = await Promise.all([
                axiosInstance.get('tasks/dashboard/'),
                axiosInstance.get('projects/')
            ]);
            setSummary(dashRes.data.summary);
            setMyTasks(dashRes.data.my_tasks);
            setProjects(projRes.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setLoading(false);
        }
    };

    const handleCreateProject = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.post('projects/', {
                name: newProjectName,
                description: newProjectDesc
            });
            setShowProjectModal(false);
            setNewProjectName('');
            setNewProjectDesc('');
            fetchData();
        } catch (error) {
            console.error('Error creating project:', error);
        }
    };

    if (loading) return <div>Loading dashboard...</div>;

    return (
        <div className="animate-fade-in">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Overview</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Here's what's happening with your tasks today.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowProjectModal(true)}>
                    <Plus size={20} /> New Project
                </button>
            </header>

            <div className="dashboard-grid">
                <div className="card stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.2)', color: 'var(--primary)' }}>
                        <CheckSquare />
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{summary.total}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Tasks</div>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8' }}>
                        <Clock />
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{summary.in_progress}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>In Progress</div>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(52, 211, 153, 0.2)', color: '#34d399' }}>
                        <CheckCircle />
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{summary.done}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Completed</div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                <div>
                    <h2 style={{ marginBottom: '16px', fontSize: '1.5rem' }}>Your Projects</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {projects.length === 0 ? (
                            <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                No projects yet. Create one to get started!
                            </div>
                        ) : projects.map(proj => (
                            <Link to={`/projects/${proj.id}`} key={proj.id} style={{ textDecoration: 'none' }}>
                                <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h3 style={{ color: 'var(--text-main)', marginBottom: '4px' }}>{proj.name}</h3>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{proj.description}</p>
                                    </div>
                                    <div style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px', color: 'var(--text-main)' }}>
                                        {proj.members.length} member(s)
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                <div>
                    <h2 style={{ marginBottom: '16px', fontSize: '1.5rem' }}>Your Tasks</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {myTasks.length === 0 ? (
                            <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                You have no tasks assigned.
                            </div>
                        ) : myTasks.map(task => (
                            <div key={task.id} className="card" style={{ padding: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <h4 style={{ margin: 0 }}>{task.title}</h4>
                                    <span className={`status-badge status-${task.status.toLowerCase().replace('_', '')}`}>
                                        {task.status.replace('_', ' ')}
                                    </span>
                                </div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                    Due: {task.due_date || 'No date'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Modal for new project */}
            {showProjectModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
                    <div className="glass-panel" style={{ padding: '32px', width: '100%', maxWidth: '500px' }}>
                        <h2 style={{ marginBottom: '24px' }}>Create New Project</h2>
                        <form onSubmit={handleCreateProject}>
                            <div className="input-group">
                                <label>Project Name</label>
                                <input required type="text" value={newProjectName} onChange={e => setNewProjectName(e.target.value)} />
                            </div>
                            <div className="input-group">
                                <label>Description</label>
                                <textarea rows="3" value={newProjectDesc} onChange={e => setNewProjectDesc(e.target.value)}></textarea>
                            </div>
                            <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', marginTop: '24px' }}>
                                <button type="button" className="btn btn-outline" onClick={() => setShowProjectModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Create Project</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
