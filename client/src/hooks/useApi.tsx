import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { User, Task, Achievement } from '@shared/schema';

export function useApi() {
  const queryClient = useQueryClient();

  // User related functions
  const useUser = () => {
    return useQuery({ 
      queryKey: ['/api/user'], 
      retry: false,
      refetchOnWindowFocus: true
    });
  };

  const useUserStats = () => {
    return useQuery({ 
      queryKey: ['/api/user/stats'], 
      retry: false,
      refetchOnWindowFocus: true
    });
  };

  // Task related functions
  const useTasks = () => {
    return useQuery({ 
      queryKey: ['/api/tasks'], 
      retry: false
    });
  };

  const useActiveTasks = () => {
    return useQuery({ 
      queryKey: ['/api/tasks/active'], 
      retry: false,
      refetchInterval: 30000 // Refresh every 30 seconds to check for expirations
    });
  };

  const useCompletedTasks = () => {
    return useQuery({ 
      queryKey: ['/api/tasks/completed'], 
      retry: false
    });
  };

  const useTask = (id: number) => {
    return useQuery({ 
      queryKey: ['/api/tasks', id], 
      retry: false,
      enabled: !!id
    });
  };

  const useCreateTask = () => {
    const mutation = useMutation({
      mutationFn: (task: Partial<Task>) => 
        apiRequest('POST', '/api/tasks', task),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
        queryClient.invalidateQueries({ queryKey: ['/api/tasks/active'] });
      }
    });

    return mutation;
  };

  const useCompleteTask = () => {
    const mutation = useMutation({
      mutationFn: (data: { taskId: number, proof: string }) =>
        apiRequest('POST', '/api/tasks/complete', data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
        queryClient.invalidateQueries({ queryKey: ['/api/tasks/active'] });
        queryClient.invalidateQueries({ queryKey: ['/api/tasks/completed'] });
        queryClient.invalidateQueries({ queryKey: ['/api/user'] });
        queryClient.invalidateQueries({ queryKey: ['/api/user/stats'] });
      }
    });

    return mutation;
  };

  const useApplyPunishment = () => {
    const mutation = useMutation({
      mutationFn: (data: { taskId: number, punishmentId: number }) =>
        apiRequest('POST', '/api/tasks/punishment', data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
        queryClient.invalidateQueries({ queryKey: ['/api/user'] });
        queryClient.invalidateQueries({ queryKey: ['/api/user/stats'] });
      }
    });

    return mutation;
  };

  // AI related functions
  const useAiSuggestions = (difficulty?: 'easy' | 'medium' | 'hard') => {
    return useQuery({ 
      queryKey: ['/api/ai/suggest', difficulty], 
      queryFn: () => {
        const url = difficulty 
          ? `/api/ai/suggest?difficulty=${difficulty}` 
          : '/api/ai/suggest';
        return fetch(url, {
          credentials: 'include'
        })
        .then(res => {
          if (!res.ok) {
            throw new Error(`Failed to get AI suggestions: ${res.status}`);
          }
          return res.json();
        });
      },
      retry: false
    });
  };

  const useDailyChallenge = () => {
    return useQuery({
      queryKey: ['/api/ai/daily-challenge'],
      queryFn: () => {
        return fetch('/api/ai/daily-challenge', {
          credentials: 'include'
        })
        .then(res => {
          if (!res.ok) {
            throw new Error(`Failed to get daily challenge: ${res.status}`);
          }
          return res.json();
        });
      },
      retry: false
    });
  };

  const useDailyTasks = () => {
    return useQuery({
      queryKey: ['/api/ai/daily-tasks'],
      queryFn: () => {
        return fetch('/api/ai/daily-tasks', {
          credentials: 'include'
        })
        .then(res => {
          if (!res.ok) {
            throw new Error(`Failed to get daily tasks: ${res.status}`);
          }
          return res.json();
        });
      },
      retry: false
    });
  };

  const useAcceptAiTask = () => {
    const mutation = useMutation({
      mutationFn: (task: Partial<Task>) => 
        apiRequest('POST', '/api/tasks/accept-suggestion', task),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
        queryClient.invalidateQueries({ queryKey: ['/api/tasks/active'] });
        queryClient.invalidateQueries({ queryKey: ['/api/ai/suggest'] });
      }
    });

    return mutation;
  };

  // Achievement related functions
  const useAchievements = () => {
    return useQuery({ 
      queryKey: ['/api/achievements'], 
      retry: false
    });
  };

  // XPass related functions
  const useAddXPass = () => {
    const mutation = useMutation({
      mutationFn: (data: { amount: number }) =>
        apiRequest('POST', '/api/xpass/add', data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      }
    });

    return mutation;
  };

  return {
    useUser,
    useUserStats,
    useTasks,
    useActiveTasks,
    useCompletedTasks,
    useTask,
    useCreateTask,
    useCompleteTask,
    useApplyPunishment,
    useAiSuggestions,
    useDailyChallenge,
    useDailyTasks,
    useAcceptAiTask,
    useAchievements,
    useAddXPass
  };
}