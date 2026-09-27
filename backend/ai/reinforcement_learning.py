import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F

# ---------------------------------------------------------
# Twin-Delayed DDPG (TD3) Scaffolding for EV Load Balancing
# ---------------------------------------------------------

class Actor(nn.Module):
    """
    The Actor network determines the optimal charging power (action) 
    given the current state (SoC, ToD tariff, time until departure, grid load).
    """
    def __init__(self, state_dim, action_dim, max_action):
        super(Actor, self).__init__()
        
        self.l1 = nn.Linear(state_dim, 256)
        self.l2 = nn.Linear(256, 256)
        self.l3 = nn.Linear(256, action_dim)
        
        self.max_action = max_action

    def forward(self, state):
        a = F.relu(self.l1(state))
        a = F.relu(self.l2(a))
        # Use tanh to keep action between -1 and 1, then scale by max_action
        # For V2G (Vehicle-to-Grid), actions can be negative (discharging).
        return self.max_action * torch.tanh(self.l3(a))


class Critic(nn.Module):
    """
    The Twin Critic networks estimate the Q-value (expected reward).
    Two networks are used to reduce overestimation bias in DDPG.
    """
    def __init__(self, state_dim, action_dim):
        super(Critic, self).__init__()
        
        # Critic 1
        self.l1 = nn.Linear(state_dim + action_dim, 256)
        self.l2 = nn.Linear(256, 256)
        self.l3 = nn.Linear(256, 1)

        # Critic 2
        self.l4 = nn.Linear(state_dim + action_dim, 256)
        self.l5 = nn.Linear(256, 256)
        self.l6 = nn.Linear(256, 1)

    def forward(self, state, action):
        sa = torch.cat([state, action], 1)
        
        q1 = F.relu(self.l1(sa))
        q1 = F.relu(self.l2(q1))
        q1 = self.l3(q1)

        q2 = F.relu(self.l4(sa))
        q2 = F.relu(self.l5(q2))
        q2 = self.l6(q2)
        
        return q1, q2

    def Q1(self, state, action):
        sa = torch.cat([state, action], 1)
        q1 = F.relu(self.l1(sa))
        q1 = F.relu(self.l2(q1))
        q1 = self.l3(q1)
        return q1

class TD3Scheduler:
    """
    TD3 Algorithm Handler.
    Manages the replay buffer, training loop, and action selection
    for ToD-aware energy orchestration.
    """
    def __init__(self, state_dim, action_dim, max_action, device='cpu'):
        self.actor = Actor(state_dim, action_dim, max_action).to(device)
        self.actor_target = Actor(state_dim, action_dim, max_action).to(device)
        self.actor_target.load_state_dict(self.actor.state_dict())
        self.actor_optimizer = torch.optim.Adam(self.actor.parameters(), lr=3e-4)

        self.critic = Critic(state_dim, action_dim).to(device)
        self.critic_target = Critic(state_dim, action_dim).to(device)
        self.critic_target.load_state_dict(self.critic.state_dict())
        self.critic_optimizer = torch.optim.Adam(self.critic.parameters(), lr=3e-4)

        self.max_action = max_action
        self.device = device
        
    def select_action(self, state):
        """
        Selects charging/discharging power based on the current state.
        State vector includes: [current_soc, tod_tariff_multiplier, time_to_departure, grid_load_kw]
        tod_tariff_multiplier: e.g., 0.8 (solar hours) or 1.2 (peak hours)
        """
        state = torch.FloatTensor(state.reshape(1, -1)).to(self.device)
        return self.actor(state).cpu().data.numpy().flatten()
        
    def train(self, replay_buffer, batch_size=256, discount=0.99, tau=0.005, policy_noise=0.2, noise_clip=0.5, policy_freq=2):
        """
        Trains the Actor and Critic networks using the Twin Delayed method.
        The reward function in the environment should heavily penalize charging during 
        1.2x peak hours and reward charging during 0.8x solar hours, subject to NITI Aayog limits.
        """
        # Scaffolding implementation for the TD3 training loop
        # Sample replay buffer...
        # Compute target Q value...
        # Optimize Critic...
        # Delayed policy updates...
        pass
