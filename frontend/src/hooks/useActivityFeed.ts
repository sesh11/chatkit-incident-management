import { useState, useCallback } from 'react'
import type { Activity } from '../types'

export const useActivityFeed = () => {
  const [activities, setActivities] = useState<Activity[]>([])

  const addActivity = useCallback((
    activity: Omit<Activity, 'id' | 'timestamp'>
  ) => {
    const newActivity: Activity = {
      ...activity,
      id: `activity-${Date.now()}-${Math.random()}`,
      timestamp: new Date()
    }

    setActivities(prev => [newActivity, ...prev])
  }, [])

  const clearActivities = useCallback(() => {
    setActivities([])
  }, [])

  return {
    activities,
    addActivity,
    clearActivities
  }
}
