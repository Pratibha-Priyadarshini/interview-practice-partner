import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import CodeEditor from './CodeEditor'
import './InterviewSession.css'

function InterviewSession({ sessionData, onEnd, token }) {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [recognition, setRecognition] = useState(null)
  const [mode, setMode] = useState('voice') // Always voice mode
  const [showEditor, setShowEditor] = useState(false)
  const [videoEnabled, setVideoEnabled] = useState(false)
  const [videoError, setVideoError] = useState(null)
  const [videoAnalysisEnabled, setVideoAnalysisEnabled] = useState(true)
  const [latestAnalysis, setLatestAnalysis] = useState(null)
  const messagesEndRef = useRef(null)
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const frameIntervalRef = useRef(null)
  const canvasRef = useRef(null)
  const speechSynthesisRef = useRef(null)
  const recognitionRef = useRef(null) // Store recognition instance for callbacks
  const finalTranscriptRef = useRef('') // Store accumulated transcript
  const silenceTimerRef = useRef(null) // Store silence detection timer
  const modeRef = useRef('voice') // Track mode with ref for reliable access in callbacks
  const isSpeakingRef = useRef(false) // Track speaking state for callbacks
  const isStartingVideoRef = useRef(false) // Prevent multiple simultaneous video starts
  const hasSpokenGreetingRef = useRef(false) // Prevent duplicate greeting
  
  // Get voice gender from sessionData, default to 'female'
  const voiceGender = sessionData?.voice_gender || 'female'

  useEffect(() => {
    // Initialize Web Speech API
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognitionInstance = new SpeechRecognition()
      recognitionInstance.continuous = true  // Keep listening continuously
      recognitionInstance.interimResults = true  // Show interim results
      recognitionInstance.lang = 'en-US'
      
      recognitionInstance.onresult = (event) => {
        // Don't process if agent is speaking
        if (isSpeakingRef.current) {
          console.log('⚠️ Ignoring speech while agent is speaking')
          return
        }
        
        let interimTranscript = ''
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscriptRef.current += transcript + ' '
          } else {
            interimTranscript += transcript
          }
        }
        
        // Show what's being said
        setInputValue(finalTranscriptRef.current + interimTranscript)
        
        // Clear existing silence timer
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current)
        }
        
        // Wait for 2 seconds of silence before sending (increased from 1.5s)
        if (finalTranscriptRef.current.trim()) {
          silenceTimerRef.current = setTimeout(() => {
            const messageToSend = finalTranscriptRef.current.trim()
            if (messageToSend && !isSpeakingRef.current) {
              console.log('Sending message after silence:', messageToSend)
              handleSend(messageToSend, true)
              finalTranscriptRef.current = ''
              setInputValue('')
            } else if (isSpeakingRef.current) {
              console.log('⚠️ Not sending - agent is speaking')
            }
          }, 2000) // Increased from 1500ms to 2000ms
        }
      }
      
      recognitionInstance.onstart = () => {
        console.log('🎤 Recognition started - listening for speech')
        setIsListening(true)
      }
      
      recognitionInstance.onerror = (event) => {
        console.error('❌ Speech recognition error:', event.error)
        // Don't stop on errors like 'no-speech', just continue
        if (event.error === 'no-speech' || event.error === 'audio-capture') {
          // These are normal, just restart
          console.log('⚠️ Restarting recognition after error:', event.error)
        } else if (event.error === 'not-allowed') {
          console.error('❌ Microphone permission denied!')
          alert('Please allow microphone access to use voice mode')
          setIsListening(false)
        }
      }
      
      recognitionInstance.onend = () => {
        // Auto-restart if we're still in voice mode and not speaking
        console.log('🔴 Recognition ended, checking if should restart...')
        console.log('   Mode:', modeRef.current, 'isSpeaking:', isSpeakingRef.current)
        
        // Don't restart if agent is speaking or about to speak
        if (modeRef.current === 'voice' && !isSpeakingRef.current) {
          console.log('🔄 Auto-restarting recognition after delay')
          // Longer delay to ensure agent has time to start speaking
          setTimeout(() => {
            // Double-check speaking state before restarting
            if (!isSpeakingRef.current && modeRef.current === 'voice') {
              try {
                recognitionInstance.start()
                console.log('✅ Recognition restarted')
              } catch (e) {
                console.log('⚠️ Recognition already started or error:', e.message)
              }
            } else {
              console.log('⏹️ Cancelled restart - agent is speaking')
            }
          }, 500) // Increased delay from 100ms to 500ms
        } else {
          console.log('⏹️ Not restarting - mode:', modeRef.current, 'isSpeaking:', isSpeakingRef.current)
          setIsListening(false)
        }
      }
      
      setRecognition(recognitionInstance)
      recognitionRef.current = recognitionInstance // Store in ref for callbacks
    }

    // Initialize video on mount with a small delay to ensure ref is attached
    const videoTimer = setTimeout(() => {
      console.log('Attempting to start video on mount')
      startVideo()
    }, 500)

    // Load voices when they become available
    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        speechSynthesis.getVoices()
      }
      // Chrome needs voices to load asynchronously
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = loadVoices
      }
      loadVoices()
    }

    // Initialize conversation with greeting
    if (sessionData.greeting && sessionData.first_question && !hasSpokenGreetingRef.current) {
      const initialMessage = {
        role: 'assistant',
        content: `${sessionData.greeting}\n\n${sessionData.first_question}`,
        timestamp: new Date().toISOString()
      }
      setMessages([initialMessage])
      
      // Mark greeting as spoken to prevent duplicates
      hasSpokenGreetingRef.current = true
      
      // Speak the greeting automatically after a short delay
      // After speaking, it will auto-start listening (handled in speakText onend)
      setTimeout(() => {
        console.log('Speaking initial greeting in voice mode')
        speakText(`${sessionData.greeting}\n\n${sessionData.first_question}`)
      }, 1000) // 1 second delay to ensure everything is loaded
    }

    // Cleanup video and speech on unmount
    return () => {
      clearTimeout(videoTimer)
      stopSpeaking()
      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current)
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionData])

  // Handle mode changes
  useEffect(() => {
    if (mode === 'voice' && messages.length > 0 && !isSpeaking) {
      // When switching to voice mode, speak the last assistant message
      const lastAssistantMessage = [...messages].reverse().find(msg => msg.role === 'assistant')
      if (lastAssistantMessage) {
        setTimeout(() => {
          speakText(lastAssistantMessage.content)
        }, 500)
      }
    } else if (mode === 'chat' && isSpeaking) {
      // Stop speaking when switching to chat mode
      stopSpeaking()
    }
  }, [mode]) // eslint-disable-line react-hooks/exhaustive-deps
  
  // Capture frame when user sends a message (for real-time analysis)
  useEffect(() => {
    if (videoEnabled && videoAnalysisEnabled && messages.length > 0) {
      // Small delay to ensure video is updated
      const timer = setTimeout(() => {
        captureAndAnalyzeFrame()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [messages.length]) // Capture when new messages arrive

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Debug: Log when videoEnabled changes
  useEffect(() => {
    console.log('videoEnabled state changed to:', videoEnabled)
  }, [videoEnabled])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const speakText = (text) => {
    // Stop any ongoing speech
    stopSpeaking()
    
    if (!text || !('speechSynthesis' in window)) {
      console.log('Speech synthesis not available')
      return
    }

    // Clean text - remove markdown and code blocks for better speech
    let cleanText = text
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/`[^`]+`/g, '') // Remove inline code
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
      .replace(/\*([^*]+)\*/g, '$1') // Remove italic
      .replace(/#{1,6}\s+/g, '') // Remove headers
      .replace(/\n+/g, '. ') // Replace newlines with periods
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()

    if (!cleanText) {
      console.log('No text to speak')
      return
    }

    console.log('Speaking:', cleanText.substring(0, 50) + '...')

    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.lang = 'en-US'
    utterance.rate = 0.95 // Natural speaking rate
    utterance.pitch = 1.0
    utterance.volume = 1.0

    // Try to use a natural voice based on selected gender
    const voices = speechSynthesis.getVoices()
    
    // Filter voices by gender preference
    let preferredVoices = voices.filter(voice => {
      if (!voice.lang.startsWith('en')) return false
      
      const voiceName = voice.name.toLowerCase()
      const isFemale = voice.gender === 'female' || voiceName.includes('female') || 
                       voiceName.includes('samantha') || voiceName.includes('susan') ||
                       voiceName.includes('karen') || voiceName.includes('moira') ||
                       voiceName.includes('veena') || voiceName.includes('zira')
      const isMale = voice.gender === 'male' || voiceName.includes('male') ||
                     voiceName.includes('daniel') || voiceName.includes('david') ||
                     voiceName.includes('alex') || voiceName.includes('mark') ||
                     voiceName.includes('richard') || voiceName.includes('ralph') ||
                     voiceName.includes('thomas')
      
      if (voiceGender === 'female') {
        return isFemale && !isMale
      } else {
        return isMale && !isFemale
      }
    })
    
    // If no gender-specific voices found, try preferred voice names
    if (preferredVoices.length === 0) {
      preferredVoices = voices.filter(voice => 
        voice.lang.startsWith('en') && (
          voice.name.includes('Google') ||
          voice.name.includes('Natural') ||
          voice.name.includes('Neural') ||
          voice.name.includes('United States')
        )
      )
    }
    
    // Final fallback to any English voice
    if (preferredVoices.length > 0) {
      utterance.voice = preferredVoices[0]
    } else if (voices.length > 0) {
      const englishVoices = voices.filter(voice => voice.lang.startsWith('en'))
      if (englishVoices.length > 0) {
        // Try to match gender preference even in fallback
        if (voiceGender === 'female') {
          const femaleVoices = englishVoices.filter(v => 
            v.gender === 'female' || v.name.toLowerCase().includes('female')
          )
          utterance.voice = femaleVoices.length > 0 ? femaleVoices[0] : englishVoices[0]
        } else {
          const maleVoices = englishVoices.filter(v => 
            v.gender === 'male' || v.name.toLowerCase().includes('male')
          )
          utterance.voice = maleVoices.length > 0 ? maleVoices[0] : englishVoices[0]
        }
      }
    }

    utterance.onstart = () => {
      console.log('🔊 Started speaking - STOPPING recognition to prevent echo')
      setIsSpeaking(true)
      isSpeakingRef.current = true // Update ref immediately
      
      // Clear any accumulated transcript and timers
      finalTranscriptRef.current = ''
      setInputValue('')
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current)
        silenceTimerRef.current = null
      }
      
      // CRITICAL: Stop recognition while speaking to prevent echo
      const recognitionInstance = recognitionRef.current
      if (recognitionInstance) {
        try {
          recognitionInstance.abort() // Use abort() instead of stop() for immediate effect
          setIsListening(false)
          console.log('✅ Recognition aborted and transcript cleared')
        } catch (e) {
          console.log('⚠️ Could not abort recognition:', e.message)
        }
      }
    }

    utterance.onend = () => {
      console.log('Finished speaking')
      setIsSpeaking(false)
      isSpeakingRef.current = false // Update ref immediately
      // In voice mode, automatically start listening after the interviewer finishes speaking
      const recognitionInstance = recognitionRef.current
      console.log('Checking recognition:', {
        mode: modeRef.current,
        hasRecognition: !!recognitionInstance,
        isListening: isListening
      })
      
      if (modeRef.current === 'voice' && recognitionInstance) {
        console.log('Auto-starting listening after speech...')
        setTimeout(() => {
          if (modeRef.current === 'voice' && !isListening) {
            try {
              console.log('Attempting to start recognition...')
              recognitionInstance.start()
              console.log('✅ Recognition start() called')
            } catch (e) {
              console.error('❌ Error starting recognition:', e.message)
              // If already started, that's okay
              if (e.message.includes('already started')) {
                console.log('Recognition already running, setting state')
                setIsListening(true)
              }
            }
          } else {
            console.log('⏹️ Skipping start - already listening or mode changed')
          }
        }, 1000) // Increased delay to 1 second for better flow
      } else {
        console.log('❌ Cannot start recognition:', {
          mode: modeRef.current,
          hasRecognition: !!recognitionInstance
        })
      }
    }

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error)
      setIsSpeaking(false)
      isSpeakingRef.current = false // Update ref immediately
      // Still try to start listening even if speech fails (unless it was just interrupted by another speech)
      const recognitionInstance = recognitionRef.current
      if (event.error !== 'interrupted' && modeRef.current === 'voice' && recognitionInstance) {
        console.log('Starting recognition after speech error')
        setTimeout(() => {
          try {
            recognitionInstance.start()
            console.log('✅ Recognition started after error')
          } catch (e) {
            console.error('❌ Error starting recognition after speech error:', e.message)
          }
        }, 800)
      }
    }

    speechSynthesisRef.current = utterance
    
    // Make sure voices are loaded before speaking
    if (speechSynthesis.getVoices().length === 0) {
      console.log('Waiting for voices to load...')
      speechSynthesis.onvoiceschanged = () => {
        console.log('Voices loaded, now speaking')
        speechSynthesis.speak(utterance)
      }
    } else {
      speechSynthesis.speak(utterance)
    }
  }

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  const handleModeChange = (newMode) => {
    console.log('Changing mode to:', newMode)
    
    // Stop speaking when switching modes
    if (mode === 'voice' && isSpeaking) {
      stopSpeaking()
    }
    
    // Stop listening when switching away from voice
    if (mode === 'voice' && isListening && recognition) {
      recognition.stop()
      setIsListening(false)
    }
    
    setMode(newMode)
    modeRef.current = newMode // Update ref as well
    
    // If switching to voice mode and there are messages, speak the last assistant message
    if (newMode === 'voice' && messages.length > 0) {
      const lastAssistantMessage = [...messages].reverse().find(msg => msg.role === 'assistant')
      if (lastAssistantMessage) {
        console.log('Speaking last message in voice mode')
        setTimeout(() => {
          speakText(lastAssistantMessage.content)
        }, 800) // Longer delay to ensure mode is fully switched
      }
    }
  }

  const handleSend = async (text, isVoice = false) => {
    if (!text || !text.trim() || loading) return

    const userMessage = {
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
      isVoice: isVoice
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setLoading(true)

    // Use ref to get current mode reliably
    const currentMode = modeRef.current
    console.log('Sending message in mode:', currentMode, 'State mode:', mode)
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    try {
      const response = await axios.post(`${API_URL}/api/interview/message`, {
        session_id: sessionData.session_id,
        message: text.trim(),
        is_voice: isVoice
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      const assistantMessage = {
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date().toISOString()
      }

      setMessages(prev => [...prev, assistantMessage])
      
      // Auto-open code editor if interviewer explicitly asks for code editor
      const responseText = response.data.response.toLowerCase()
      const explicitEditorKeywords = ['code editor', 'use the editor', 'use the code editor']
      const shouldOpenEditor = explicitEditorKeywords.some(keyword => responseText.includes(keyword))
      
      if (shouldOpenEditor && !showEditor) {
        console.log('🔔 Code editor requested - opening editor')
        setShowEditor(true)
      }

      // Check mode again after async operation
      const modeAfterResponse = modeRef.current
      console.log('Response received. Mode ref:', modeAfterResponse, 'Response:', response.data.response?.substring(0, 50))
      
      // Always speak if we're in voice mode OR if this was a voice message
      if ((modeAfterResponse === 'voice' || isVoice) && response.data.response) {
        console.log('Voice mode active - speaking response')
        // Small delay to ensure message is rendered
        setTimeout(() => {
          console.log('Actually calling speakText now')
          speakText(response.data.response)
        }, 300)
      } else {
        console.log('Not speaking - mode ref is:', modeAfterResponse, 'isVoice:', isVoice)
      }

      // Check if interview should end
      if (!response.data.should_continue) {
        handleEndInterview()
      }
    } catch (err) {
      console.error(err)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
        error: true
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend(inputValue)
    }
  }

  const toggleListening = () => {
    if (!recognition) {
      alert('Speech recognition is not available in your browser. Please use text input.')
      return
    }

    if (isListening) {
      recognition.stop()
      setIsListening(false)
      stopSpeaking() // Stop speaking when stopping listening
    } else {
      stopSpeaking() // Stop any ongoing speech before starting to listen
      recognition.start()
      setIsListening(true)
    }
  }

  const captureAndAnalyzeFrame = async () => {
    if (!videoRef.current || !videoEnabled || !videoAnalysisEnabled || loading) {
      return
    }

    try {
      // Create canvas to capture frame
      if (!canvasRef.current) {
        canvasRef.current = document.createElement('canvas')
      }
      const canvas = canvasRef.current
      const video = videoRef.current

      // Check if video is ready
      if (!video.videoWidth || !video.videoHeight) {
        return
      }

      // Set canvas dimensions to video dimensions
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Draw current video frame to canvas
      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Convert canvas to base64
      const imageBase64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1]

      // Get current question context
      const currentQuestion = messages.length > 0 && messages[messages.length - 1].role === 'assistant'
        ? messages[messages.length - 1].content.substring(0, 200)
        : ''

      // Send frame to backend for analysis (fire and forget - don't block)
      console.log('📸 Capturing frame for analysis...')
      axios.post(`${API_URL}/api/interview/video-frame`, {
        session_id: sessionData.session_id,
        image_base64: imageBase64,
        current_question: currentQuestion
      }, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(response => {
        if (response.data && response.data.analysis) {
          console.log('✅ Video analysis received:', response.data.analysis)
          setLatestAnalysis(response.data.analysis)
        }
      }).catch(err => {
        // Silently fail - video analysis is optional
        console.log('❌ Video analysis error (non-critical):', err.message)
      })

    } catch (err) {
      console.log('Error capturing frame (non-critical):', err.message)
    }
  }

  const startVideo = async () => {
    // Prevent multiple simultaneous starts
    if (isStartingVideoRef.current || streamRef.current) {
      console.log('Video already starting or active, skipping...')
      return
    }
    
    isStartingVideoRef.current = true
    
    try {
      console.log('Starting video...')
      setVideoError(null)
      
      // Get the stream first
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      })
      
      console.log('Got video stream:', stream)
      console.log('Video tracks:', stream.getVideoTracks())
      
      // Now that we have the stream, set it on the video element (which should already be rendered)
      if (videoRef.current) {
        console.log('Setting video srcObject')
        videoRef.current.srcObject = stream
        streamRef.current = stream
        
        // Set videoEnabled to true to show the video
        setVideoEnabled(true)
        
        // Wait for video to be ready before starting capture
        videoRef.current.onloadedmetadata = async () => {
          console.log('Video metadata loaded, dimensions:', videoRef.current.videoWidth, 'x', videoRef.current.videoHeight)
          try {
            // Play the video
            await videoRef.current.play()
            console.log('Video playing successfully')
            
            // Start periodic frame capture for analysis (every 5 seconds)
            if (videoAnalysisEnabled) {
              console.log('🎥 Starting periodic video analysis (every 5 seconds)')
              frameIntervalRef.current = setInterval(() => {
                captureAndAnalyzeFrame()
              }, 5000) // Capture every 5 seconds
            }
          } catch (playErr) {
            console.error('Error playing video:', playErr)
          }
        }
        
        // Also try to play immediately
        try {
          await videoRef.current.play()
          console.log('Video play called immediately')
        } catch (e) {
          console.log('Immediate play failed, waiting for metadata:', e.message)
        }
      } else {
        console.error('videoRef.current is null!')
        setVideoError('Video element not ready. Please try clicking "Enable Camera" button.')
        // Stop the stream since we can't use it
        stream.getTracks().forEach(track => track.stop())
      }
    } catch (err) {
      console.error('Error accessing webcam:', err)
      let errorMessage = 'Could not access webcam. '
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage += 'Please grant camera permissions in your browser settings.'
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage += 'No camera found on your device.'
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage += 'Camera is already in use by another application.'
      } else {
        errorMessage += 'Please check your camera settings.'
      }
      
      setVideoError(errorMessage)
      setVideoEnabled(false)
    } finally {
      isStartingVideoRef.current = false
    }
  }

  const stopVideo = () => {
    console.log('Stopping video...')
    
    // Reset the starting flag
    isStartingVideoRef.current = false
    
    // Stop frame capture interval
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current)
      frameIntervalRef.current = null
    }
    
    // Clear video element FIRST
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.srcObject = null
      // Force load to reset the video element
      videoRef.current.load()
      console.log('Video element cleared and reset')
    }
    
    // Stop all media tracks
    if (streamRef.current) {
      console.log('Stopping stream tracks:', streamRef.current.getTracks().length)
      const tracks = streamRef.current.getTracks()
      tracks.forEach(track => {
        console.log('Stopping track:', track.kind, track.label, 'enabled:', track.enabled, 'readyState:', track.readyState)
        track.enabled = false
        track.stop()
        console.log('Track stopped. New readyState:', track.readyState)
      })
      streamRef.current = null
    }
    
    setVideoEnabled(false)
    setLatestAnalysis(null)
    console.log('Video stopped successfully')
  }

  const toggleVideo = () => {
    if (videoEnabled) {
      stopVideo()
    } else {
      startVideo()
    }
  }

  const handleCodeSubmit = async (code, language) => {
    if (!code.trim() || loading) return

    setLoading(true)
    
    // Close the editor immediately after submission
    setShowEditor(false)
    
    try {
      // Send code to backend for review - this will automatically add it to conversation history
      const codeResponse = await axios.post(`${API_URL}/api/interview/code-submission`, {
        session_id: sessionData.session_id,
        code: code.trim(),
        language: language
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      // Add code message to conversation
      const codeMessage = {
        role: 'user',
        content: `[Code Submission in ${language}]\n\n\`\`\`${language}\n${code.trim()}\n\`\`\``,
        timestamp: new Date().toISOString(),
        isCode: true
      }

      setMessages(prev => [...prev, codeMessage])

      // Add reviewer response (from backend)
      const assistantMessage = {
        role: 'assistant',
        content: codeResponse.data.review || 'Thank you for submitting your code. Let me review it.',
        timestamp: new Date().toISOString()
      }

      setMessages(prev => [...prev, assistantMessage])

      // In voice mode, speak the code review
      if (mode === 'voice' && assistantMessage.content) {
        setTimeout(() => {
          speakText(assistantMessage.content)
        }, 300)
      }

    } catch (err) {
      console.error(err)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your code. Please try again.',
        timestamp: new Date().toISOString(),
        error: true
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleEndInterview = async () => {
    stopVideo() // Stop video when interview ends
    setLoading(true)
    try {
      const response = await axios.post(`${API_URL}/api/interview/end`, {
        session_id: sessionData.session_id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      onEnd(response.data)
    } catch (err) {
      console.error(err)
      alert('Failed to get feedback. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="interview-session">
      <div className="session-header">
        <div className="session-info">
          <h2>
            {sessionData.interview_round === 'hr' ? '👔 HR Round' : '💻 Technical Round'} - {sessionData.role}
          </h2>
          <p>{messages.length} messages</p>
        </div>
        <div className="session-controls">
          <button
            onClick={toggleVideo}
            className={`btn-video ${videoEnabled ? 'active' : ''}`}
            title={videoEnabled ? 'Turn off camera' : 'Turn on camera'}
          >
            {videoEnabled ? '📹 Camera On' : '📷 Camera Off'}
          </button>
          <button
            onClick={handleEndInterview}
            disabled={loading}
            className="btn-secondary"
          >
            End Interview
          </button>
        </div>
      </div>

      <div className="session-content">
        <div className="video-container">
          {/* Always render video element so ref is available, but hide it when not enabled */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="candidate-video"
            style={{ display: videoEnabled ? 'block' : 'none' }}
          />
          {videoEnabled && latestAnalysis && videoAnalysisEnabled && latestAnalysis.eye_contact !== 'unknown' && (
            <div className="video-analysis-overlay">
              <div className="analysis-indicators">
                {latestAnalysis.eye_contact && latestAnalysis.eye_contact !== 'unknown' && (
                  <span className={`indicator eye-contact-${latestAnalysis.eye_contact}`}>
                    👁️ {latestAnalysis.eye_contact}
                  </span>
                )}
                {latestAnalysis.confidence_level && latestAnalysis.confidence_level !== 'neutral' && latestAnalysis.confidence_level !== 'unknown' && (
                  <span className={`indicator confidence-${latestAnalysis.confidence_level}`}>
                    {latestAnalysis.confidence_level === 'high' ? '💪' : latestAnalysis.confidence_level === 'moderate' ? '👍' : '🙂'} {latestAnalysis.confidence_level}
                  </span>
                )}
                {latestAnalysis.malpractice && latestAnalysis.malpractice !== 'none' && (
                  <span className={`indicator malpractice-${latestAnalysis.malpractice}`}>
                    {latestAnalysis.malpractice === 'detected' ? '🔴' : '🟡'} {latestAnalysis.malpractice}
                  </span>
                )}
              </div>
            </div>
          )}
          {!videoEnabled && !videoError && (
            <div className="video-placeholder">
              <div className="placeholder-content">
                <span className="placeholder-icon">📷</span>
                <p>Camera is off</p>
                <p className="placeholder-hint">Enable camera for AI analysis of your presentation</p>
                <button onClick={startVideo} className="btn-enable-camera">
                  Enable Camera
                </button>
              </div>
            </div>
          )}
          {videoError && (
            <div className="video-error">
              <p>{videoError}</p>
              <button onClick={startVideo} className="btn-retry">
                Retry
              </button>
            </div>
          )}
        </div>

        <div className="chat-container">
          <div className="mode-switcher">
            <div className="voice-mode-indicator">
              {isSpeaking ? '🔊 AI Speaking...' : isListening ? '🔴 Listening...' : '🎤 Voice Mode Active'}
            </div>
            <button
              className={showEditor ? 'mode-btn active' : 'mode-btn'}
              onClick={() => setShowEditor(!showEditor)}
            >
              {showEditor ? '📝 Editor On' : '📝 Editor'}
            </button>
          </div>

          {showEditor && (
            <div className="code-editor-wrapper">
              <CodeEditor
                onCodeSubmit={handleCodeSubmit}
                sessionId={sessionData.session_id}
                disabled={loading}
                onClose={() => setShowEditor(false)}
              />
            </div>
          )}

          <div className="messages-container">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`message ${msg.role === 'user' ? 'user-message' : 'assistant-message'}`}
          >
            <div className={`message-content ${msg.isCode ? 'code-message' : ''} ${mode === 'voice' && msg.role === 'assistant' && !msg.isCode ? 'voice-mode-text' : ''}`}>
              {msg.isCode ? (
                <div className="code-message-wrapper">
                  <div className="code-label">📝 Code Submission</div>
                  <pre className="code-block"><code>{msg.content.replace(/\[Code Submission in [^\]]+\]\s*\n*/g, '').replace(/```[\w]*\n/g, '').replace(/```/g, '').trim()}</code></pre>
                </div>
              ) : (
                <>
                  {mode === 'voice' && msg.role === 'assistant' && (
                    <div className="speaking-indicator">
                      {isSpeaking && idx === messages.length - 1 ? '🔊 Speaking' : ''}
                    </div>
                  )}
                  {msg.content.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </>
              )}
            </div>
            <div className="message-timestamp">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
        {loading && (
          <div className="message assistant-message">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
            <div ref={messagesEndRef} />
          </div>

          <div className="input-container">
            <div className="voice-controls">
              <div className={`voice-status ${isListening ? 'listening' : isSpeaking ? 'speaking' : 'idle'}`}>
                {isSpeaking ? (
                  <>
                    <span className="status-icon">🔊</span>
                    <span className="status-text">Interviewer is speaking...</span>
                  </>
                ) : isListening ? (
                  <>
                    <span className="status-icon pulse">🎤</span>
                    <span className="status-text">Listening... Speak now</span>
                    {inputValue && <span className="interim-text">"{inputValue}"</span>}
                  </>
                ) : (
                  <>
                    <span className="status-icon">💬</span>
                    <span className="status-text">Voice conversation active</span>
                  </>
                )}
              </div>
              {isSpeaking && (
                <button
                  onClick={stopSpeaking}
                  className="btn-stop-speaking"
                  title="Stop speaking"
                >
                  ⏹️ Stop
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InterviewSession

