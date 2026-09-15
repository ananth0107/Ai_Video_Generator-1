import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const STORAGE_KEY = 'thamili_language_preference';

export const translations = {
  en: {
    // Top Header
    headerTitle: 'THAMILI AI VIDEO',
    promptToVideoBreadcrumb: 'PROMPT TO VIDEO',
    imageToVideoBreadcrumb: 'IMAGE TO VIDEO',
    charactersBreadcrumb: 'CHARACTERS LIBRARY',
    videoStudioBreadcrumb: 'VIDEO STUDIO',
    toggleTheme: 'Toggle Theme',
    signIn: 'Sign In',
    getStarted: 'Get Started',
    langName: 'English',
    langSwitchTitle: 'Language',

    // Sidebar
    aiVideo: 'AI Video',
    promptToVideo: 'Prompt to Video',
    imageToVideo: 'Image to Video',
    characters: 'Characters',
    upgradeToPro: 'Upgrade to Pro',
    proPerkDesc: 'Unlock 4K AI Video rendering & neural studio access.',

    history: 'History',
    historyBreadcrumb: 'HISTORY',
    historyPageTitle: 'History',
    historyPageSubtitle: 'View and manage your previously generated videos.',
    allHistory: 'All History',
    promptHistory: 'Prompt to Video',
    promptHistoryDesc: 'Videos generated from typed text prompts',
    imageHistory: 'Image to Video',
    imageHistoryDesc: 'Videos animated and edited from source images',
    sourceEditedImage: 'Source / Edited Image',
    typedPrompt: 'Typed Prompt',
    editInStudio: 'Edit in Studio',
    reuseImage: 'Reuse Image',
    noPromptVideosFound: 'No prompt-based videos found.',
    noImageVideosFound: 'No image-based videos found.',
    filterAll: 'All Videos',
    filterPrompt: 'Prompt to Video',
    filterImage: 'Image to Video',
    saveVideoModalTitle: 'Save Video to History',
    videoNameLabel: 'Video Name',
    videoNamePlaceholder: 'Enter a name for your video...',
    videoNameRequired: 'Please enter a video name',
    editVideoNameTitle: 'Edit Video Name',
    deleteVideoTitle: 'Delete Video?',
    deleteVideoConfirm: 'Are you sure you want to delete this video from History?',
    noVideosTitle: 'No videos yet',
    noVideosDesc: 'Your generated videos will appear here.',
    createFirstVideo: 'Create Your First Video',
    searchHistoryPlaceholder: 'Search by video name or prompt...',
    editName: 'Rename',
    rename: 'Rename',
    renameVideoTitle: 'Rename Video',
    renameBtn: 'Rename',
    delete: 'Delete',
    playVideo: 'Play Video',
    videoSavedSuccess: 'Video saved to History!',
    videoUpdatedSuccess: 'Video renamed successfully!',
    videoDeletedSuccess: 'Video deleted from History',

    // Common Buttons & Actions
    generate: 'Generate',
    cancel: 'Cancel',
    save: 'Save',
    saved: 'Saved',
    share: 'Share',
    download: 'Download',
    regenerate: 'Regenerate',
    change: 'Change',
    remove: 'Remove',
    search: 'Search',
    all: 'All',
    actors: 'Actors',
    actresses: 'Actresses',
    custom: 'Custom',
    selected: 'Selected',
    ready: 'Ready',
    close: 'Close',
    copyLink: 'Copy Video Link',

    // Prompt to Video Studio
    p2vTitle: 'Prompt to Video Studio',
    p2vBadge: 'Neural Diffusion v2.5',
    p2vSubtitle: 'Transform natural language prompts into stunning 4K/60fps cinematic video sequences.',
    p2vCardTitle: 'Prompt to Video Creation',
    p2vCardDesc: 'Describe scene dynamics, characters, lighting atmosphere, and environment.',
    aiEnhance: 'AI Enhance',
    step1PromptLabel: 'Video Description & Prompt',
    promptPlaceholder: 'Describe the video you want to generate in detail... (e.g. A cinematic shot in golden sunlight with flowing breeze and atmospheric mist, 4K render)',
    surpriseMe: 'Surprise Me',
    presetsLabel: 'Presets:',
    
    stepCharactersLabel: 'Characters',
    selectCharacters: 'Select Characters',
    searchCharactersPlaceholder: 'Search characters...',
    noCharactersFound: 'No characters found matching query.',
    addCharacter: '+ Add Character',
    addSelectedCharacters: 'Add Selected',
    added: '✓ Added',
    selectedCharactersLabel: 'Selected Characters:',
    noSelectedCharacters: 'No characters selected (Optional).',

    stepAspectRatioLabel: 'Aspect Ratio',
    stepVisualStyleLabel: 'Visual Style',
    stepCameraDynamicsLabel: 'Camera Dynamics',
    stepAtmosphericLightingLabel: 'Atmospheric Lighting',
    
    generate4kVideo: 'Generate 4K Video',

    // Image to Video Studio
    i2vTitle: 'Image to Video Studio',
    i2vBadge: 'Spatial Depth Engine v2.5',
    i2vSubtitle: 'Transform static photos, concept artwork, and illustrations into fluid cinematic motion.',
    i2vCardTitle: 'Image to Video Creation',
    i2vCardDesc: 'Upload source image, configure camera vector path, motion intensity, and lighting physics.',
    stepSourceImageLabel: 'Source Image',
    sourceImageSubtext: 'PNG, JPG, SVG, WebP • 4K Depth Ready',
    dragDropText: 'Drag & drop image or',
    browseFiles: 'browse files',
    dragDropSub: 'Supports PNG, JPG, SVG up to 50MB',
    imageReadyStatus: 'Ready for 4K Neural Motion Diffusion',
    stepMotionPromptLabel: 'Motion Dynamics & Camera Prompt',
    motionPromptPlaceholder: 'Describe how the image elements and camera should move... (e.g. Slowly zoom toward the subject while lights sweep smoothly)',
    quickPromptsLabel: 'Quick Prompts:',
    stepMotionIntensityLabel: 'Motion Intensity',
    stepCameraVectorLabel: 'Camera Vector',
    animateImageToVideo: 'Animate Image to 4K Video',

    // Characters Page
    charactersPageTitle: 'AI Characters Studio',
    charactersPageSubtitle: 'Explore our master library of Tamil superstar actors and actresses. Select characters to integrate into your Prompt to Video and Image to Video creations.',
    characterCountBadge: 'Characters Library',
    createNewCharacter: 'Create New Character',
    searchCharactersPagePlaceholder: 'Search characters by name, role, or style...',
    actorTag: 'Actor',
    actressTag: 'Actress',
    customTag: 'Custom',
    useInPromptVideo: 'Prompt to Video',
    useInImageVideo: 'Image to Video',

    // Character Modal
    modalCreateTitle: 'Create New AI Character',
    modalCreateSubtitle: 'Upload a reference image and define your character\'s persona & lore.',
    modalPortraitLabel: 'Character Portrait / Reference Image',
    modalPortraitSub: 'High resolution face or character concept image',
    modalCharNameLabel: 'Character Name *',
    modalCharRoleLabel: 'Role / Archetype',
    modalCharCategoryLabel: 'Category / Role Type',
    modalCharStyleLabel: 'Visual Style',
    modalCharLoreLabel: 'Character Lore / Bio',
    modalCharPromptLabel: 'Custom Video Generation Prompt',
    modalSaveBtn: 'Save Character',
    modalSaveAndLaunchBtn: 'Save & Open in Studio',

    // Output Player
    generatedVideoOutput: 'Generated Video Output',
    thamiliPreviewBadge: 'THAMILI PREVIEW',
    hdrEnhancedTag: '4K HDR Enhanced',
    exportOptions: 'EXPORT OPTIONS',
    downloadMp4: 'Download MP4 Video',
    downloadMp4Sub: 'High-Definition 1080p Web/Mobile',
    downloadWebM: 'Download WebM',
    downloadWebMSub: 'Fast Web Optimized Video',
    downloadPng: 'Download Keyframe (PNG)',
    downloadPngSub: 'High-Res Single Snapshot',
    speed: 'Speed',
    renderingVideo: 'Rendering MP4 Video...',
    neuralEngineTag: 'THAMILI Neural Engine v2.0',

    // Dropdown Option Values
    styleOptions: {
      'Cinematic': 'Cinematic',
      'Realistic': 'Realistic',
      'Anime': 'Anime',
      '3D Render': '3D Render'
    },
    cameraDynamicsOptions: {
      'Smooth Zoom': 'Smooth Zoom',
      'Pan Right': 'Pan Right',
      'Drone Orbit': 'Drone Orbit',
      'Dynamic Flow': 'Dynamic Flow'
    },
    motionIntensityOptions: {
      'Subtle': 'Subtle',
      'Smooth': 'Smooth',
      'Dynamic': 'Dynamic',
      'Fast': 'Fast'
    },
    cameraVectorOptions: {
      'Zoom In': 'Zoom In',
      'Pan Left': 'Pan Left',
      'Tilt Up': 'Tilt Up',
      'Orbit 360': 'Orbit 360'
    },
    lightingOptions: {
      'Volumetric Sun': 'Volumetric Sun',
      'Cyber Neon': 'Cyber Neon',
      'Golden Hour': 'Golden Hour',
      'Ethereal Fog': 'Ethereal Fog',
      'Natural Day': 'Natural Day'
    },
    aspectRatioOptions: {
      '16:9': '16:9 (Landscape)',
      '9:16': '9:16 (Portrait)',
      '1:1': '1:1 (Square)'
    },

    // Generating Stages
    genStages: [
      { percent: 15, text: 'Analyzing text prompt semantics and spatial vectors...' },
      { percent: 42, text: 'Generating neural motion diffusion keyframes...' },
      { percent: 78, text: 'Rendering high-resolution cinematic frames...' },
      { percent: 96, text: 'Applying lighting consistency and color grading...' },
      { percent: 100, text: 'Video generation completed!' }
    ],
    genStagesImage: [
      { percent: 15, text: 'Analyzing image subject, depth map and motion vectors...' },
      { percent: 45, text: 'Synthesizing neural fluid dynamics and lighting trails...' },
      { percent: 75, text: 'Rendering smooth high-definition temporal frames...' },
      { percent: 95, text: 'Applying lighting bloom and color grade...' },
      { percent: 100, text: 'Video generation completed!' }
    ],

    // Quick Inspiration Chips
    promptPresets: [
      { title: '🌌 Cosmic Nebula', text: 'Swirling interstellar deep space nebula with glowing violet cosmic dust, distant spiral galaxies, and shimmering supernova starlight in 4k cinematic render.' },
      { title: '🏙️ Cyberpunk City', text: 'Flying hover vehicles cruising through neon-lit skyways in heavy rain with glowing volumetric billboard reflections in a cyberpunk megalopolis.' },
      { title: '🌊 Ocean Sunset', text: 'Rhythmic turquoise ocean waves breaking softly on a warm sandy beach during a pastel pink and orange golden hour sunset with palm tree silhouettes.' },
      { title: '🦅 Alpine Sunrise', text: 'A golden sunrise over misty mountain peaks with a glowing horizon, volumetric sun rays, and soaring eagles in 4k cinematic render.' },
      { title: '🌸 Sakura Twilight', text: 'Gentle pink sakura petals drifting over a moonlit Japanese shrine pagoda beside a tranquil lotus river in twilight breeze.' }
    ],

    motionChips: [
      '✨ Smooth Forward Dolly',
      '🌊 Fluid Atmospheric Motion',
      '⚡ Neon Particle Sweep',
      '🍃 Gentle Breeze Drift',
      '🔍 Cinematic Focus Pull'
    ]
  },

  ta: {
    // Top Header
    headerTitle: 'தமிழ் AI வீடியோ',
    promptToVideoBreadcrumb: 'பிராம்ட் டூ வீடியோ',
    imageToVideoBreadcrumb: 'படத்திலிருந்து வீடியோ',
    charactersBreadcrumb: 'கதாபாத்திரங்கள் நூலகம்',
    videoStudioBreadcrumb: 'வீடியோ ஸ்டுடியோ',
    toggleTheme: 'தீம் மாற்று',
    signIn: 'உள்நுழைக',
    getStarted: 'தொடங்குக',
    langName: 'தமிழ்',
    langSwitchTitle: 'மொழி',

    // Sidebar
    aiVideo: 'AI வீடியோ',
    promptToVideo: 'பிராம்ட் டூ வீடியோ',
    imageToVideo: 'படத்திலிருந்து வீடியோ',
    characters: 'கதாபாத்திரங்கள்',
    upgradeToPro: 'புரோவிற்கு மேம்படுத்துக',
    proPerkDesc: '4K AI வீடியோ ரெண்டரிங் மற்றும் நியூரல் ஸ்டுடியோ அணுகலைத் திறக்கவும்.',

    history: 'வரலாறு',
    historyBreadcrumb: 'வரலாறு',
    historyPageTitle: 'வரலாறு',
    historyPageSubtitle: 'நீங்கள் முன்பு உருவாக்கிய வீடியோக்களைக் காணுங்கள் மற்றும் நிர்வகியுங்கள்.',
    allHistory: 'அனைத்து வரலாறு',
    promptHistory: 'பிராம்ட் டூ வீடியோ',
    promptHistoryDesc: 'தட்டச்சு செய்த பிராம்ட் மூலம் உருவாக்கப்பட்ட வீடியோக்கள்',
    imageHistory: 'படம் டூ வீடியோ',
    imageHistoryDesc: 'படங்களிலிருந்து அனிமேஷன் மற்றும் திருத்தப்பட்ட வீடியோக்கள்',
    sourceEditedImage: 'மூல / திருத்திய படம்',
    typedPrompt: 'தட்டச்சு செய்த பிராம்ட்',
    editInStudio: 'ஸ்டுடியோவில் திருத்து',
    reuseImage: 'படத்தை மீண்டும் பயன்படுத்து',
    noPromptVideosFound: 'பிராம்ட் மூலம் உருவாக்கப்பட்ட வீடியோக்கள் எதுவும் இல்லை.',
    noImageVideosFound: 'படத்திலிருந்து உருவாக்கப்பட்ட வீடியோக்கள் எதுவும் இல்லை.',
    filterAll: 'அனைத்து வீடியோக்கள்',
    filterPrompt: 'பிராம்ட் டூ வீடியோ',
    filterImage: 'படம் டூ வீடியோ',
    saveVideoModalTitle: 'வீடியோவை வரலாற்றில் சேமிக்கவும்',
    videoNameLabel: 'வீடியோ பெயர்',
    videoNamePlaceholder: 'வீடியோவின் பெயரை உள்ளிடவும்...',
    videoNameRequired: 'வீடியோ பெயரை உள்ளிடவும்',
    editVideoNameTitle: 'வீடியோ பெயரை மாற்றவும்',
    deleteVideoTitle: 'வீடியோவை நீக்கவா?',
    deleteVideoConfirm: 'இந்த வீடியோவை வரலாற்றிலிருந்து நீக்க உறுதியாக உள்ளீர்களா?',
    noVideosTitle: 'வீடியோக்கள் எதுவும் இல்லை',
    noVideosDesc: 'நீங்கள் உருவாக்கிய வீடியோக்கள் இங்கே தோன்றும்.',
    createFirstVideo: 'உங்கள் முதல் வீடியோவை உருவாக்கவும்',
    searchHistoryPlaceholder: 'வீடியோ பெயர் அல்லது பிராம்ட் மூலம் தேடுங்கள்...',
    editName: 'மறுபெயரிடு (Rename)',
    rename: 'மறுபெயரிடு (Rename)',
    renameVideoTitle: 'வீடியோ பெயரை மாற்று (Rename)',
    renameBtn: 'மறுபெயரிடு',
    delete: 'நீக்கு (Delete)',
    playVideo: 'வீடியோவை இயக்கு',
    videoSavedSuccess: 'வீடியோ வரலாற்றில் சேமிக்கப்பட்டது!',
    videoUpdatedSuccess: 'வீடியோ பெயர் மாற்றப்பட்டது!',
    videoDeletedSuccess: 'வீடியோ வரலாற்றிலிருந்து நீக்கப்பட்டது',

    // Common Buttons & Actions
    generate: 'உருவாக்கு',
    cancel: 'ரத்து செய்',
    save: 'சேமி',
    saved: 'சேமிக்கப்பட்டது',
    share: 'பகிர்',
    download: 'பதிவிறக்கு',
    regenerate: 'மீண்டும் உருவாக்கு',
    change: 'மாற்று',
    remove: 'நீக்கு',
    search: 'தேடு',
    all: 'அனைத்தும்',
    actors: 'நடிகர்கள்',
    actresses: 'நடிகைகள்',
    custom: 'தனிப்பயன்',
    selected: 'தேர்ந்தெடுக்கப்பட்டது',
    ready: 'தயாராக உள்ளது',
    close: 'மூடு',
    copyLink: 'வீடியோ இணைப்பை நகலெடு',

    // Prompt to Video Studio
    p2vTitle: 'பிராம்ட் டூ வீடியோ ஸ்டுடியோ',
    p2vBadge: 'நியூரல் டிஃப்யூஷன் v2.5',
    p2vSubtitle: 'இயல்பான உரை விளக்கங்களை பிரமிக்க வைக்கும் 4K/60fps சினிமா வீடியோவாக மாற்றுங்கள்.',
    p2vCardTitle: 'பிராம்ட் டூ வீடியோ உருவாக்கம்',
    p2vCardDesc: 'காட்சி இயக்கம், கதாபாத்திரங்கள், ஒளி அமைப்பு மற்றும் சூழலை விவரிக்கவும்.',
    aiEnhance: 'AI மேம்பாடு',
    step1PromptLabel: 'வீடியோ விளக்கம் & பிராம்ட்',
    promptPlaceholder: 'நீங்கள் உருவாக்க விரும்பும் வீடியோவை விரிவாக விவரிக்கவும்... (எ.கா. தங்க நிற சூரிய ஒளியில் மிதமான காற்று மற்றும் பனிமூட்டத்துடன் கூடிய சினிமா காட்சி, 4K ரெண்டர்)',
    surpriseMe: 'திடீர் யோசனை',
    presetsLabel: 'முன்னமைவுகள்:',

    stepCharactersLabel: 'கதாபாத்திரங்கள்',
    selectCharacters: 'கதாபாத்திரங்களைத் தேர்ந்தெடுக்கவும்',
    searchCharactersPlaceholder: 'கதாபாத்திரங்களைத் தேடுங்கள்...',
    noCharactersFound: 'பொருந்தும் கதாபாத்திரங்கள் எதுவும் கிடைக்கவில்லை.',
    addCharacter: '+ கதாபாத்திரத்தைச் சேர்',
    addSelectedCharacters: 'தேர்ந்தெடுத்ததைச் சேர்',
    added: '✓ சேர்க்கப்பட்டது',
    selectedCharactersLabel: 'தேர்ந்தெடுக்கப்பட்ட கதாபாத்திரங்கள்:',
    noSelectedCharacters: 'கதாபாத்திரங்கள் எதுவும் தேர்ந்தெடுக்கப்படவில்லை (விருப்பமானது).',

    stepAspectRatioLabel: 'விகித அளவு (Aspect Ratio)',
    stepVisualStyleLabel: 'காட்சி பாணி (Visual Style)',
    stepCameraDynamicsLabel: 'கேமரா இயக்கம் (Camera Dynamics)',
    stepAtmosphericLightingLabel: 'சூழல் ஒளி அமைப்பு (Atmospheric Lighting)',
    
    generate4kVideo: '4K வீடியோவை உருவாக்கு',

    // Image to Video Studio
    i2vTitle: 'படத்திலிருந்து வீடியோ ஸ்டுடியோ',
    i2vBadge: 'ஸ்பேஷியல் டெப்த் என்ஜின் v2.5',
    i2vSubtitle: 'நிலையான புகைப்படங்கள் மற்றும் கலைப்படைப்புகளை உயிரோட்டமான சினிமா வீடியோவாக மாற்றுங்கள்.',
    i2vCardTitle: 'படத்திலிருந்து வீடியோ உருவாக்கம்',
    i2vCardDesc: 'மூலப் படத்தைப் பதிவேற்றி, கேமரா பாதை, இயக்க வேகம் மற்றும் ஒளி அமைப்பைத் தேர்வு செய்யவும்.',
    stepSourceImageLabel: 'மூலப் படம் (Source Image)',
    sourceImageSubtext: 'PNG, JPG, SVG, WebP • 4K டெப்த் தயார்',
    dragDropText: 'படத்தை இழுத்து விடவும் அல்லது',
    browseFiles: 'கோப்புகளை உலாவவும்',
    dragDropSub: '50MB வரை PNG, JPG, SVG கோப்புகள் ஆதரிக்கப்படுகின்றன',
    imageReadyStatus: '4K நியூரல் மோஷன் டிஃப்யூஷனுக்குத் தயாராக உள்ளது',
    stepMotionPromptLabel: 'இயக்க விவரம் & கேமரா பிராம்ட்',
    motionPromptPlaceholder: 'பட உறுப்புகளும் கேமராவும் எவ்வாறு நகர வேண்டும் என்பதை விவரிக்கவும்... (எ.கா. ஒளிரும் ஒளிக்கற்றைகளுடன் மையப் பொருளை நோக்கி மெதுவாக ஜூம் செய்க)',
    quickPromptsLabel: 'விரைவு பிராம்ட்கள்:',
    stepMotionIntensityLabel: 'இயக்க வேகம் (Motion Intensity)',
    stepCameraVectorLabel: 'கேமரா திசை (Camera Vector)',
    animateImageToVideo: 'படத்தை 4K வீடியோவாக அனிமேட் செய்',

    // Characters Page
    charactersPageTitle: 'AI கதாபாத்திரங்கள் ஸ்டுடியோ',
    charactersPageSubtitle: 'எங்கள் தமிழ் திரையுலக முன்னணி நடிகர்கள் மற்றும் நடிகைகளின் நூலகத்தை ஆராயுங்கள். உங்கள் பிராம்ட் டூ வீடியோ மற்றும் இமேஜ் டூ வீடியோ உருவாக்கங்களில் இவர்களை எளிதாக இணையுங்கள்.',
    characterCountBadge: 'கதாபாத்திரங்கள் நூலகம்',
    createNewCharacter: 'புதிய கதாபாத்திரத்தை உருவாக்கு',
    searchCharactersPagePlaceholder: 'பெயர், பாத்திரம் அல்லது பாணி மூலம் கதாபாத்திரங்களைத் தேடுங்கள்...',
    actorTag: 'நடிகர்',
    actressTag: 'நடிகை',
    customTag: 'தனிப்பயன்',
    useInPromptVideo: 'பிராம்ட் டூ வீடியோவில் பயன்படுத்து',
    useInImageVideo: 'படத்திலிருந்து வீடியோவில் பயன்படுத்து',

    // Character Modal
    modalCreateTitle: 'புதிய AI கதாபாத்திரத்தை உருவாக்கு',
    modalCreateSubtitle: 'ஒரு குறிப்புப் படத்தைப் பதிவேற்றி, உங்கள் கதாபாத்திரத்தின் குணாதிசயம் மற்றும் கதையை வரையறுக்கவும்.',
    modalPortraitLabel: 'கதாபாத்திர படம் / குறிப்புப் படம்',
    modalPortraitSub: 'உயர்தர முகம் அல்லது கதாபாத்திரக் கருத்துப் படம்',
    modalCharNameLabel: 'கதாபாத்திரத்தின் பெயர் *',
    modalCharRoleLabel: 'பாத்திரம் / தன்மை',
    modalCharCategoryLabel: 'வகை / பாத்திர வகை',
    modalCharStyleLabel: 'காட்சி பாணி',
    modalCharLoreLabel: 'கதாபாத்திர வரலாறு / குறிப்பு',
    modalCharPromptLabel: 'தனிப்பயன் வீடியோ உருவாக்கும் பிராம்ட்',
    modalSaveBtn: 'கதாபாத்திரத்தை சேமி',
    modalSaveAndLaunchBtn: 'சேமித்து ஸ்டுடியோவில் திறக்க',

    // Output Player
    generatedVideoOutput: 'உருவாக்கப்பட்ட வீடியோ வெளியீடு',
    thamiliPreviewBadge: 'தமிழ் முன்னோட்டம்',
    hdrEnhancedTag: '4K HDR மேம்படுத்தப்பட்டது',
    exportOptions: 'ஏற்றுமதி விருப்பங்கள்',
    downloadMp4: 'MP4 வீடியோவை பதிவிறக்கு',
    downloadMp4Sub: 'உயர் வரையறை 1080p வலை/மொபைல்',
    downloadWebM: 'WebM பதிவிறக்கு',
    downloadWebMSub: 'விரைவான வலை உகந்த வீடியோ',
    downloadPng: 'முக்கிய படத்தை பதிவிறக்கு (PNG)',
    downloadPngSub: 'உயர்தர ஒற்றை ஸ்னாப்ஷாட்',
    speed: 'வேகம்',
    renderingVideo: 'MP4 வீடியோ ரெண்டரிங் ஆகிறது...',
    neuralEngineTag: 'தமிழ் நியூரல் என்ஜின் v2.0',

    // Dropdown Option Values
    styleOptions: {
      'Cinematic': 'சினிமா பாணி (Cinematic)',
      'Realistic': 'நிஜ பாணி (Realistic)',
      'Anime': 'அனிமே (Anime)',
      '3D Render': '3D ரெண்டர் (3D Render)'
    },
    cameraDynamicsOptions: {
      'Smooth Zoom': 'மென்மையான ஜூம் (Smooth Zoom)',
      'Pan Right': 'வலது நகர்வு (Pan Right)',
      'Drone Orbit': 'ட்ரோன் சுற்றுப்பாதை (Drone Orbit)',
      'Dynamic Flow': 'இயக்க ஓட்டம் (Dynamic Flow)'
    },
    motionIntensityOptions: {
      'Subtle': 'மெல்லிய (Subtle)',
      'Smooth': 'மென்மையான (Smooth)',
      'Dynamic': 'வேகமான (Dynamic)',
      'Fast': 'அதிவேக (Fast)'
    },
    cameraVectorOptions: {
      'Zoom In': 'உள்நோக்கி ஜூம் (Zoom In)',
      'Pan Left': 'இடது நகர்வு (Pan Left)',
      'Tilt Up': 'மேல்நோக்கி சாய்வு (Tilt Up)',
      'Orbit 360': '360° சுற்றுப்பாதை (Orbit 360)'
    },
    lightingOptions: {
      'Volumetric Sun': 'சூரிய ஒளிக்கதிர்கள் (Volumetric Sun)',
      'Cyber Neon': 'சைபர் நியான் ஒளி (Cyber Neon)',
      'Golden Hour': 'மாலை பொன்னிற ஒளி (Golden Hour)',
      'Ethereal Fog': 'மர்ம பனிமூட்டம் (Ethereal Fog)',
      'Natural Day': 'இயற்கை பகல் ஒளி (Natural Day)'
    },
    aspectRatioOptions: {
      '16:9': '16:9 (கிடைமட்டம் / Landscape)',
      '9:16': '9:16 (செங்குத்து / Portrait)',
      '1:1': '1:1 (சதுரம் / Square)'
    },

    // Generating Stages
    genStages: [
      { percent: 15, text: 'உரை பிராம்ட் மற்றும் காட்சி திசையன்களை பகுப்பாய்வு செய்கிறது...' },
      { percent: 42, text: 'நியூரல் மோஷன் டிஃப்யூஷன் முக்கிய காட்சிகளை உருவாக்குகிறது...' },
      { percent: 78, text: 'உயர் வரையறை சினிமா பிரேம்களை ரெண்டரிங் செய்கிறது...' },
      { percent: 96, text: 'ஒளி அமைப்பு மற்றும் வண்ணத் தரத்தை மேம்படுத்துகிறது...' },
      { percent: 100, text: 'வீடியோ உருவாக்கம் வெற்றிகரமாக முடிந்தது!' }
    ],
    genStagesImage: [
      { percent: 15, text: 'படத்தின் முக்கிய பொருள் மற்றும் ஆழ வரைபடத்தை பகுப்பாய்வு செய்கிறது...' },
      { percent: 45, text: 'நியூரல் திரவ இயக்கங்கள் மற்றும் ஒளிப் பாதைகளை ஒருங்கிணைக்கிறது...' },
      { percent: 75, text: 'மென்மையான உயர் வரையறை பிரேம்களை ரெண்டரிங் செய்கிறது...' },
      { percent: 95, text: 'ஒளிப் பிரகாசம் மற்றும் வண்ணத் தரத்தை பூர்த்தி செய்கிறது...' },
      { percent: 100, text: 'வீடியோ உருவாக்கம் வெற்றிகரமாக முடிந்தது!' }
    ],

    // Quick Inspiration Chips
    promptPresets: [
      { title: '🌌 பிரபஞ்ச விண்மீன் திரள்', text: 'ஒளிரும் ஊதா நிற விண்வெளி தூசிகள், சுழல் விண்மீன் திரள்கள் மற்றும் சூப்பர்நோவா நட்சத்திர ஒளியுடன் கூடிய 4K சினிமா விண்வெளி காட்சி.' },
      { title: '🏙️ சைபர்பங்க் நகரம்', text: 'மழையில் ஒளிரும் நியான் விளக்குகள் மற்றும் பறக்கும் வாகனங்களுடன் கூடிய எதிர்கால சைபர்பங்க் பெருநகர காட்சி.' },
      { title: '🌊 கடலோர சூரிய அஸ்தமனம்', text: 'பொன்னிற மாலை வேளையில் பனைமர நிழல்களுடன் மென்மையாக கரையைத் தொடும் அழகிய நீலக் கடல் அலைகள்.' },
      { title: '🦅 மலை உச்சியில் சூரியோதயம்', text: 'பனிமூட்டமான மலைச் சிகரங்களின் மேல் தங்க நிற சூரிய கதிர்களுடன் வானில் வட்டமிடும் கழுகுகளின் 4K சினிமா காட்சி.' },
      { title: '🌸 சகுரா அந்திப்பொழுது', text: 'அமைதியான தாமரை நதிக்கரையில் நிலவொளியில் மென்மையான இளஞ்சிவப்பு சகுரா மலர்கள் காற்றில் மிதக்கும் காட்சி.' }
    ],

    motionChips: [
      '✨ மென்மையான முன்னோக்கி ஜூம்',
      '🌊 திரவ சூழல் இயக்கம்',
      '⚡ நியான் துகள் வீச்சு',
      '🍃 மென்மையான தென்றல் அசைவு',
      '🔍 சினிமா ஃபோகஸ் புல்'
    ]
  }
};

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'en';
    } catch {
      return 'en';
    }
  });

  const setLanguage = (lang) => {
    if (lang === 'en' || lang === 'ta') {
      setLanguageState(lang);
      try {
        localStorage.setItem(STORAGE_KEY, lang);
      } catch (err) {
        console.error('Failed to save language preference:', err);
      }
    }
  };

  const t = (key, fallback = '') => {
    const currentDict = translations[language] || translations.en;
    if (currentDict && currentDict[key] !== undefined) {
      return currentDict[key];
    }
    const fallbackDict = translations.en;
    return fallbackDict[key] !== undefined ? fallbackDict[key] : fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, lang: language, setLanguage, setLang: setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
