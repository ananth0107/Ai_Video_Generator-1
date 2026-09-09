import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';

export default function ChatPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { lang, t } = useLanguage();

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: lang === 'ta'
        ? `வணக்கம்! நான் **தமிழி (THAMILI) AI** — உங்கள் தமிழ்-முதல் அறிவார்ந்த துணை.\n\nநீங்கள் என்னிடம் தமிழில் சந்தேகங்கள் கேட்கலாம், கவிதைகள் அல்லது கட்டுரைகள் எழுதச் சொல்லலாம், அல்லது வீடியோ உருவாக்கத்திற்கான காட்சிகளை திட்டமிடலாம். நான் உங்களுக்கு எவ்வாறு உதவட்டும்?`
        : `Hello! I am **THAMILI AI** — your Tamil-First intelligent companion.\n\nYou can converse with me in Tamil or English, ask questions, brainstorm concepts, or craft creative video prompts for our AI Video Studio. How may I assist you today?`,
      time: 'Just now',
      showVideoAction: true,
      reactions: { likes: 0, liked: false, disliked: false },
      isPlayingAudio: false
    }
  ]);

  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [attachedImage, setAttachedImage] = useState(null);
  const [activeVoiceWave, setActiveVoiceWave] = useState(false);
  const [currentlyPlayingAudioId, setCurrentlyPlayingAudioId] = useState(null);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (textToSend) => {
    const text = (typeof textToSend === 'string' ? textToSend : inputVal).trim();
    if (!text && !attachedImage) return;

    const fullMsgText = attachedImage
      ? (text ? `${text} (இணைக்கப்பட்ட படம்: ${attachedImage.name})` : `இந்தப் படத்தை விவரித்து அனிமேஷன் செய்யவும்: ${attachedImage.name}`)
      : text;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: fullMsgText,
      imagePreview: attachedImage?.url || null,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setAttachedImage(null);
    setIsTyping(true);

    // Contextual responses based on user query
    setTimeout(() => {
      setIsTyping(false);
      let replyText = '';
      let isVideoRelated = false;

      const lowerText = fullMsgText.toLowerCase();
      if (lowerText.includes('வீடியோ') || lowerText.includes('video') || lowerText.includes('காட்சி') || lowerText.includes('prompt')) {
        isVideoRelated = true;
        replyText = lang === 'ta'
          ? `அருமையான யோசனை! உங்கள் விபரத்திற்கான வீடியோ காட்சி அமைப்பை உருவாக்கியுள்ளேன்:\n\n✨ **AI வீடியோ காட்சி விபரம்:**\n"${fullMsgText}"\n\nஇந்த காட்சியை உயர்தர HD/4K வீடியோவாக மாற்ற, நமது **எழுத்து மூலம் வீடியோ (Prompt to Video)** அல்லது **படம் மூலம் வீடியோ (Image to Video)** ஸ்டுடியோவுக்கு செல்லலாம்.`
          : `Excellent idea! I have structured a cinematic video prompt based on your request:\n\n✨ **AI Video Scene Prompt:**\n"${fullMsgText}"\n\nTo generate this into high-definition motion video, you can jump straight to our **Prompt to Video** or **Image to Video** studio below.`;
      } else if (lowerText.includes('திருக்குறள்') || lowerText.includes('thirukkural') || lowerText.includes('kural')) {
        replyText = lang === 'ta'
          ? `📖 **திருக்குறள் விளக்கம்:**\n\n*"அகர முதல எழுத்தெல்லாம் ஆதி\nபகவன் முதற்றே உலகு."*\n\n**பொருள்:** எழுத்துக்களுக்கெல்லாம் 'அ' எவ்வாறு தொடக்கமாக இருக்கிறதோ, அதுபோல இந்த உலகத்திற்கு முதன்மையானவன் கடவுள் (இயற்கை).\n\nதிருக்குறள் வாழ்வியல் நெறிகளையும், அறம், பொருள், இன்பம் ஆகிய முப்பால்களையும் எக்காலத்திற்கும் பொருந்தும் வகையில் விளக்குகிறது.`
          : `📖 **Thirukkural Insight:**\n\n*"Akara Mudhala Ezhuththellam Aadhi\nBagavan Mudhatre Ulagu."*\n\n**Meaning:** As the letter 'A' is the start of all alphabets, so is the Primordial Being the beginning of the entire universe.\n\nThirukkural provides timeless ethical wisdom for daily life, governance, and philosophy.`;
      } else if (lowerText.includes('கவிதை') || lowerText.includes('poem') || lowerText.includes('பாடல்')) {
        replyText = lang === 'ta'
          ? `🌸 **தமிழி AI கவிதை:**\n\nவானில் மிதக்கும் மேகக்கூட்டம்,\nமண்ணில் பொழியும் முத்துமழை!\nதமிழ்மொழியின் சொல்லழகில்,\nஎழுந்து நிற்கும் புதிய ஒளி!`
          : `🌸 **THAMILI AI Poetry:**\n\nBeneath the azure Tamil sky,\nWhere ancient rivers softly glide,\nWisdom and knowledge ever fly,\nWith modern AI side by side.`;
      } else {
        replyText = lang === 'ta'
          ? `மிக்க மகிழ்ச்சி! உங்கள் கேள்வி: **"${fullMsgText}"**\n\nதமிழி AI உங்கள் தேவையை மிகச் சரியாக புரிந்து கொண்டுள்ளது. நான் தமிழ் இலக்கணம், அறிவியல், பொது அறிவு, கணினி நிரலாக்கம் மற்றும் ஆக்கப்பூர்வமான வீடியோ ஆலோசனைகளை உங்களுக்கு வழங்க தயாராக உள்ளேன்.`
          : `Great question! You asked about: **"${fullMsgText}"**\n\nTHAMILI AI has processed your request. I can help you with Tamil literature, general knowledge, creative writing, translations, code, or crafting video prompts.`;
      }

      const aiReply = {
        id: Date.now() + 1,
        sender: 'ai',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        showVideoAction: isVideoRelated,
        reactions: { likes: 0, liked: false, disliked: false },
        isPlayingAudio: false
      };

      setMessages((prev) => [...prev, aiReply]);
      showToast(lang === 'ta' ? 'தமிழி AI பதிலளித்துள்ளது' : 'Response received from THAMILI AI', 'Sparkles');
    }, 1000);
  };

  const handleVoiceToggle = () => {
    if (!isListening) {
      setIsListening(true);
      setActiveVoiceWave(true);
      showToast(lang === 'ta' ? 'குரல் பதிவு தொடங்குகிறது... தமிழில் பேசுங்கள்' : 'Voice listening active... speak now', 'Audio');
      setTimeout(() => {
        setIsListening(false);
        setActiveVoiceWave(false);
        const sampleVoice = lang === 'ta' ? 'வானில் பறக்கும் மேகங்கள் மீது சூரிய ஒளி பாயும் அழகிய வீடியோ காட்சி' : 'Cinematic sunset with glowing golden clouds in high motion';
        setInputVal(sampleVoice);
        showToast(lang === 'ta' ? 'குரல் உரை பெறப்பட்டது!' : 'Voice transcribed!', 'Check');
      }, 2800);
    } else {
      setIsListening(false);
      setActiveVoiceWave(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAttachedImage({ name: file.name, url });
      showToast(lang === 'ta' ? `படம் "${file.name}" இணைக்கப்பட்டது!` : `Image "${file.name}" attached!`, 'Image');
    }
  };

  const handleAudioPlay = (msgId) => {
    if (currentlyPlayingAudioId === msgId) {
      setCurrentlyPlayingAudioId(null);
      showToast(lang === 'ta' ? 'குரல் ஒலி நிறுத்தம்' : 'Speech stopped', 'Audio');
    } else {
      setCurrentlyPlayingAudioId(msgId);
      showToast(lang === 'ta' ? 'தமிழி AI குரல் ஒலிக்கிறது...' : 'Playing THAMILI AI voice...', 'Audio');
      setTimeout(() => {
        setCurrentlyPlayingAudioId(null);
      }, 4000);
    }
  };

  const handleCopyText = (text) => {
    navigator.clipboard?.writeText(text);
    showToast(lang === 'ta' ? 'உரை நகலெடுக்கப்பட்டது!' : 'Copied to clipboard!', 'BookmarkCheck');
  };

  const handleLikeMessage = (msgId) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id === msgId) {
          const liked = !m.reactions?.liked;
          return {
            ...m,
            reactions: {
              ...m.reactions,
              liked,
              disliked: false,
              likes: liked ? (m.reactions?.likes || 0) + 1 : Math.max(0, (m.reactions?.likes || 1) - 1)
            }
          };
        }
        return m;
      })
    );
    showToast(lang === 'ta' ? 'உங்கள் கருத்துக்கு நன்றி!' : 'Thanks for your feedback!', 'Check');
  };

  const quickPills = [
    { label: t('chatPillVoice'), icon: <Icons.Audio />, action: () => handleVoiceToggle() },
    { label: t('chatPillAsk'), icon: <Icons.Chat />, action: () => setInputVal(lang === 'ta' ? 'தமிழி AI என்னென்ன செய்யும்?' : 'What can THAMILI AI do?') },
    { label: t('chatPillImage'), icon: <Icons.Image />, action: () => fileInputRef.current?.click() },
    { label: t('chatPillDiscover'), icon: <Icons.Sparkles />, action: () => handleSend(lang === 'ta' ? 'தமிழ்நாட்டின் வரலாற்று சிறப்புகள் சிலவற்றை சுருக்கமாக கூறுக.' : 'Briefly summarize the historic heritage of Tamil Nadu.') },
    { label: t('chatPillLearn'), icon: <Icons.Docs />, action: () => handleSend(lang === 'ta' ? 'திருக்குறள் அறத்துப்பாலின் முக்கிய கருத்துக்கள் யாவை?' : 'Key insights from Thirukkural on virtues.') },
  ];

  return (
    <div className="thamili-chat-view-container">
      {/* Brand Hero Banner */}
      <div className="chat-brand-hero">
        <div className="chat-hero-banner-content">
          <div className="chat-brand-badge">
            <Icons.Sparkles />
            <span>{t('brandPill')}</span>
          </div>

          <div className="chat-hero-brand-row">
            <div className="chat-hero-icon-box">
              <img
                src="/thamili-logo.png"
                alt="தமிழி THAMILI Logo"
                className="chat-hero-logo-img"
              />
            </div>
            <div>
              <h1 className="chat-hero-title">
                {lang === 'ta' ? 'தமிழி' : 'THAMILI'} <span className="chat-hero-title-en">— THAMILI —</span>
              </h1>
              <p className="chat-hero-subtitle">
                {lang === 'ta' ? '— அனைவருக்கும் அறிவூட்டும் துணை —' : '— TAMIL-FIRST AI COMPANION —'}
              </p>
            </div>
          </div>

          {/* Quick Feature Badge Bar (Voice, Ask, Image, Discover, Learn) */}
          <div className="chat-feature-pills-bar">
            {quickPills.map((pill, idx) => (
              <button
                key={idx}
                type="button"
                className="chat-feature-pill-btn"
                onClick={pill.action}
              >
                <span className="pill-icon-wrap">{pill.icon}</span>
                <span>{pill.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Interactive Chat Window */}
      <div className="thamili-chat-card">
        {/* Chat Header */}
        <div className="chat-card-topbar">
          <div className="chat-card-title-group">
            <div className="chat-status-indicator">
              <span className="pulse-green-dot"></span>
            </div>
            <div>
              <span className="chat-topbar-title">{lang === 'ta' ? 'தமிழி நேரடி AI உரையாடல்' : 'THAMILI Live AI Chat'}</span>
              <span className="chat-topbar-model">Multi-Modal Tamil Neural Engine 4.0</span>
            </div>
          </div>

          <div className="chat-topbar-actions">
            <button
              type="button"
              className="chat-action-small-btn"
              onClick={() => {
                setMessages([messages[0]]);
                showToast(lang === 'ta' ? 'புதிய உரையாடல் தொடங்கியது' : 'New chat started', 'RotateCw');
              }}
              title="Reset Chat"
            >
              <Icons.RotateCw />
              <span>{t('chatNewChatBtn')}</span>
            </button>
          </div>
        </div>

        {/* Chat Messages Feed */}
        <div className="chat-messages-feed">
          {messages.map((m) => {
            const isAi = m.sender === 'ai';
            const isPlaying = currentlyPlayingAudioId === m.id;

            return (
              <div key={m.id} className={`chat-message-row ${isAi ? 'msg-ai' : 'msg-user'}`}>
                {isAi && (
                  <div className="chat-avatar-box ai-avatar-box">
                    <img src="/thamili-logo.png" alt="தமிழி" className="chat-avatar-img" />
                  </div>
                )}

                <div className="chat-bubble-content-wrap">
                  <div className={`chat-message-bubble ${isAi ? 'bubble-ai' : 'bubble-user'}`}>
                    {/* User attached image preview */}
                    {m.imagePreview && (
                      <div className="bubble-attached-img-wrap">
                        <img src={m.imagePreview} alt="Attached Preview" className="bubble-attached-img" />
                      </div>
                    )}

                    <div className="chat-message-text" style={{ whiteSpace: 'pre-wrap' }}>
                      {m.text}
                    </div>

                    {/* Quick Video Generator Card Jump inside chat */}
                    {m.showVideoAction && (
                      <div className="chat-video-suggest-box">
                        <div className="suggest-title">
                          <Icons.Video />
                          <span>{lang === 'ta' ? 'AI வீடியோ உருவாக்க விருப்பங்கள்:' : 'AI Video Studio Tools:'}</span>
                        </div>
                        <div className="suggest-buttons-row">
                          <button
                            type="button"
                            onClick={() => navigate('/prompt-to-video')}
                            className="suggest-video-btn btn-prompt-jump"
                          >
                            <Icons.Sparkles />
                            <span>{lang === 'ta' ? 'எழுத்து மூலம் வீடியோ உருவாக்க →' : 'Prompt to Video Studio →'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => navigate('/image-to-video')}
                            className="suggest-video-btn btn-image-jump"
                          >
                            <Icons.Image />
                            <span>{lang === 'ta' ? 'படம் மூலம் வீடியோ உருவாக்க →' : 'Image to Video Studio →'}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Interactive Action Bar on AI messages (Listen, Copy, Like) */}
                  {isAi && (
                    <div className="chat-msg-actions-bar">
                      <button
                        type="button"
                        className={`msg-action-icon-btn ${isPlaying ? 'audio-playing-btn' : ''}`}
                        onClick={() => handleAudioPlay(m.id)}
                        title={isPlaying ? 'Stop Voice' : 'Listen with Voice / குரல் கேட்க'}
                      >
                        {isPlaying ? (
                          <div className="audio-live-bars">
                            <span></span><span></span><span></span>
                          </div>
                        ) : (
                          <Icons.Audio />
                        )}
                        <span>{isPlaying ? (lang === 'ta' ? 'ஒலிக்கிறது...' : 'Playing...') : (lang === 'ta' ? 'கேட்க' : 'Listen')}</span>
                      </button>

                      <button
                        type="button"
                        className="msg-action-icon-btn"
                        onClick={() => handleCopyText(m.text)}
                        title="Copy message"
                      >
                        <Icons.Bookmark />
                        <span>{lang === 'ta' ? 'நகலெடு' : 'Copy'}</span>
                      </button>

                      <button
                        type="button"
                        className={`msg-action-icon-btn ${m.reactions?.liked ? 'liked-active' : ''}`}
                        onClick={() => handleLikeMessage(m.id)}
                        title="Helpful"
                      >
                        <Icons.Check />
                        <span>{m.reactions?.liked ? (lang === 'ta' ? 'பயனுள்ளது ✓' : 'Helpful ✓') : (lang === 'ta' ? 'பயனுள்ளது' : 'Helpful')}</span>
                      </button>

                      <span className="chat-message-time">{m.time}</span>
                    </div>
                  )}

                  {!isAi && <span className="chat-message-time">{m.time}</span>}
                </div>

                {!isAi && (
                  <div className="chat-avatar-box user-avatar-box">
                    <span>{lang === 'ta' ? 'நான்' : 'ME'}</span>
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing state indicator */}
          {isTyping && (
            <div className="chat-message-row msg-ai">
              <div className="chat-avatar-box ai-avatar-box">
                <img src="/thamili-logo.png" alt="தமிழி" className="chat-avatar-img" />
              </div>
              <div className="chat-message-bubble bubble-ai typing-bubble">
                <span className="chat-typing-dot"></span>
                <span className="chat-typing-dot"></span>
                <span className="chat-typing-dot"></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompt Chips */}
        <div className="chat-prompts-tray">
          <span className="prompts-tray-label">{t('chatSuggestedPrompts')}</span>
          <div className="prompts-scroll-row">
            {[t('chatPrompt1'), t('chatPrompt2'), t('chatPrompt3'), t('chatPrompt4')].map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSend(p)}
                className="prompt-chip-btn"
              >
                <span>{p}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Live Voice Recording Wave Overlay */}
        {activeVoiceWave && (
          <div className="voice-live-banner">
            <div className="voice-wave-animation">
              <span></span><span></span><span></span><span></span><span></span><span></span><span></span>
            </div>
            <span className="voice-wave-text">
              {lang === 'ta' ? 'குரல் கேட்கிறது... உங்கள் குரலை தமிழில் பேசவும்...' : 'Listening... please speak in Tamil or English...'}
            </span>
            <button
              type="button"
              className="voice-stop-btn"
              onClick={() => {
                setIsListening(false);
                setActiveVoiceWave(false);
              }}
            >
              <Icons.X />
            </button>
          </div>
        )}

        {/* Attached Image Preview in Input tray */}
        {attachedImage && (
          <div className="attached-image-preview-tray">
            <img src={attachedImage.url} alt="Attached" className="attached-thumb-img" />
            <div className="attached-info">
              <span className="attached-filename">{attachedImage.name}</span>
              <span className="attached-tag">Image Attached for AI</span>
            </div>
            <button
              type="button"
              onClick={() => setAttachedImage(null)}
              className="attached-remove-btn"
              title="Remove image"
            >
              <Icons.X />
            </button>
          </div>
        )}

        {/* Input Bar Area */}
        <div className="chat-input-container">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="chat-input-form"
          >
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              style={{ display: 'none' }}
            />

            {/* Attach Image Button */}
            <button
              type="button"
              className="chat-attach-btn"
              onClick={() => fileInputRef.current?.click()}
              title="Upload Image / படம் இணைக்க"
            >
              <Icons.Image />
            </button>

            {/* Voice Input Button */}
            <button
              type="button"
              className={`chat-voice-btn ${isListening ? 'listening-active' : ''}`}
              onClick={handleVoiceToggle}
              title="Voice Input (Tamil) / குரல் வழி பேசுங்கள்"
            >
              <Icons.Audio />
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={t('chatPlaceholder')}
              className="chat-main-text-input"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputVal.trim() && !attachedImage}
              className="chat-submit-send-btn"
            >
              <span>{t('chatSendBtn')}</span>
              <Icons.ArrowRight />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
