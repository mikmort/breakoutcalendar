// Simple iCal parser for calendar events
export interface CalendarEvent {
  day: number
  start: number
  end: number
  title: string
}

export function parseICalFile(icalContent: string): CalendarEvent[] {
  const events: CalendarEvent[] = []
  
  // Split by VEVENT blocks
  const veventRegex = /BEGIN:VEVENT([\s\S]*?)END:VEVENT/g
  let match
  
  while ((match = veventRegex.exec(icalContent)) !== null) {
    const eventBlock = match[1]
    
    // Extract SUMMARY (title)
    const summaryMatch = eventBlock.match(/SUMMARY:(.+)/i)
    const title = summaryMatch ? summaryMatch[1].trim() : 'Untitled Event'
    
    // Extract DTSTART
    const dtStartMatch = eventBlock.match(/DTSTART[^:]*:(\d{8}T?\d{0,6}Z?)/i)
    if (!dtStartMatch) continue
    
    // Extract DTEND
    const dtEndMatch = eventBlock.match(/DTEND[^:]*:(\d{8}T?\d{0,6}Z?)/i)
    if (!dtEndMatch) continue
    
    const startDateTime = parseICalDateTime(dtStartMatch[1])
    const endDateTime = parseICalDateTime(dtEndMatch[1])
    
    if (startDateTime && endDateTime) {
      // Convert to day of week (0 = Sunday, 1 = Monday, etc.)
      const day = startDateTime.getDay()
      
      // Convert to hour of day
      const start = startDateTime.getHours() + startDateTime.getMinutes() / 60
      const end = endDateTime.getHours() + endDateTime.getMinutes() / 60
      
      // Only include events that are within reasonable bounds for the game (8 AM to 6 PM)
      if (start >= 8 && end <= 18 && start < end) {
        events.push({ day, start, end, title })
      }
    }
  }
  
  return events
}

function parseICalDateTime(dateTimeStr: string): Date | null {
  try {
    // Handle different iCal date formats
    if (dateTimeStr.includes('T')) {
      // YYYYMMDDTHHMMSSZ or YYYYMMDDTHHMMSS
      const dateStr = dateTimeStr.replace(/[TZ]/g, '')
      const year = parseInt(dateStr.substring(0, 4))
      const month = parseInt(dateStr.substring(4, 6)) - 1 // Month is 0-indexed
      const day = parseInt(dateStr.substring(6, 8))
      const hour = parseInt(dateStr.substring(8, 10) || '0')
      const minute = parseInt(dateStr.substring(10, 12) || '0')
      const second = parseInt(dateStr.substring(12, 14) || '0')
      
      return new Date(year, month, day, hour, minute, second)
    } else {
      // YYYYMMDD (all-day event)
      const year = parseInt(dateTimeStr.substring(0, 4))
      const month = parseInt(dateTimeStr.substring(4, 6)) - 1
      const day = parseInt(dateTimeStr.substring(6, 8))
      
      return new Date(year, month, day)
    }
  } catch (error) {
    console.error('Error parsing iCal date:', dateTimeStr, error)
    return null
  }
}

// Generate sample events for demonstration
export function getSampleEvents(): CalendarEvent[] {
  return [
    // Sunday (day 0)
    { day: 0, start: 10, end: 11, title: 'Brunch' },
    { day: 0, start: 14, end: 16, title: 'Family Time' },
    
    // Monday (day 1)
    { day: 1, start: 8, end: 9, title: 'Morning Jog' },
    { day: 1, start: 9, end: 10, title: 'Standup' },
    { day: 1, start: 11, end: 12, title: 'Code Review' },
    { day: 1, start: 13, end: 14, title: 'Lunch & Learn' },
    { day: 1, start: 15, end: 16, title: 'Team Meeting' },
    { day: 1, start: 16, end: 17, title: 'Sprint Planning' },
    
    // Tuesday (day 2)
    { day: 2, start: 8, end: 9, title: 'Gym Session' },
    { day: 2, start: 10, end: 11, title: '1:1 with Manager' },
    { day: 2, start: 12, end: 13, title: 'Lunch with Alice' },
    { day: 2, start: 14, end: 15, title: 'Client Call' },
    { day: 2, start: 15, end: 16, title: 'Design Review' },
    { day: 2, start: 17, end: 18, title: 'Architecture Meeting' },
    
    // Wednesday (day 3)
    { day: 3, start: 8, end: 9, title: 'Morning Yoga' },
    { day: 3, start: 9, end: 10, title: 'Daily Standup' },
    { day: 3, start: 10, end: 12, title: 'Feature Development' },
    { day: 3, start: 13, end: 14, title: 'Team Lunch' },
    { day: 3, start: 15, end: 16, title: 'Bug Triage' },
    { day: 3, start: 16, end: 17, title: 'Demo Prep' },
    
    // Thursday (day 4)
    { day: 4, start: 9, end: 10, title: 'Standup' },
    { day: 4, start: 10, end: 11, title: 'Security Review' },
    { day: 4, start: 11, end: 12, title: 'Performance Testing' },
    { day: 4, start: 14, end: 16, title: 'Quarterly Presentation' },
    { day: 4, start: 16, end: 17, title: 'Stakeholder Sync' },
    { day: 4, start: 17, end: 18, title: 'Release Planning' },
    
    // Friday (day 5)
    { day: 5, start: 9, end: 10, title: 'Standup' },
    { day: 5, start: 10, end: 11, title: 'Code Deployment' },
    { day: 5, start: 11, end: 12, title: 'Doctor Appointment' },
    { day: 5, start: 13, end: 14, title: 'Team Retrospective' },
    { day: 5, start: 15, end: 16, title: 'Knowledge Sharing' },
    { day: 5, start: 16, end: 18, title: 'Happy Hour' },
    
    // Saturday (day 6)
    { day: 6, start: 9, end: 10, title: 'Weekend Workout' },
    { day: 6, start: 10, end: 11, title: 'Coffee with Friends' },
    { day: 6, start: 12, end: 14, title: 'Personal Project' },
    { day: 6, start: 15, end: 16, title: 'Grocery Shopping' },
  ]
}
