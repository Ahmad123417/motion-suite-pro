import type { GenerateVideoPayload } from './geminiService'

type Settings = NonNullable<GenerateVideoPayload['generationContext']>

export interface BlueprintKeyPose {
  objectId: string
  actionId: string
  frame: number
  bounds: { x: number; y: number; width: number; height: number }
  state: string
  transition: 'transform' | 'move' | 'reveal' | 'hold'
  anchors?: { id: string; x: number; y: number }[]
  attachments?: { anchor: string; objectId: string; targetAnchor: string }[]
}

export interface CreativeBlueprint {
  version: 1
  intent: string
  style: string
  settings: Settings
  objects: {
    id: string
    subject: string
    appearance: string
    position: string
    details: string[]
    relationships: { objectId: string; relationship: string }[]
  }[]
  actions: {
    id: string
    objectIds: string[]
    startFrame: number
    endFrame: number
    fromState: string
    change: string
    toState: string
    motion: string
  }[]
  shots: {
    id: string
    startFrame: number
    endFrame: number
    objective: string
    actionIds: string[]
    transition: { objectIds: string[]; description: string }
  }[]
  composition: { hierarchy: string; framing: string; collisionAvoidance: string }
  text: { mode: 'none' | 'requested' | 'minimal'; items: { objectId: string; content: string }[] }
  // Optional version-1 extension: older plans remain valid without invented poses.
  keyPoses?: BlueprintKeyPose[]
}

export const BLUEPRINT_INSTRUCTION = `You are the Creative Director for a Remotion animation. Return ONLY a compact JSON Visual Blueprint, not TSX, markdown or commentary.
Plan the user's actual subject and intended visual outcome before an engineer constructs it. Respect the original brief, references, supplied asset, style, exact wording, background and active settings. Do not inherit other project content.
Use this exact structure (all fields required):
{
  "version": 1,
  "intent": "user intent and intended visual outcome",
  "style": "appropriate visual language and construction method",
  "settings": {"width":0,"height":0,"fps":0,"durationInFrames":0,"isTransparent":false,"scale":0,"offsetX":0,"offsetY":0,"speedMultiplier":0,"glowIntensity":0},
  "objects": [{"id":"subject","subject":"recognizable subject","appearance":"specific geometry, silhouette, material or typography","position":"relative canvas placement and bounds","details":["specific details communicating the concept"],"relationships":[{"objectId":"other","relationship":"physical or informational relationship"}]}],
  "actions": [{"id":"action","objectIds":["subject"],"startFrame":0,"endFrame":1,"fromState":"initial object state","change":"concrete causal action or intentional hold","toState":"resulting state of the SAME objects","motion":"deterministic paths, pivots, deformation or easing serving that action"}],
  "shots": [{"id":"shot","startFrame":0,"endFrame":1,"objective":"purpose of this shot","actionIds":["action"],"transition":{"objectIds":["subject"],"description":"how identity, state or spatial relationships carry into the next shot, or final hold"}}],
  "composition":{"hierarchy":"attention order","framing":"aspect-aware spatial organization and coherent coordinate scale","collisionAvoidance":"bounds, readable areas and spacing at motion extremes"},
  "text":{"mode":"none | requested | minimal","items":[{"objectId":"subject","content":"exact visible wording"}]},
  "keyPoses":[{"objectId":"subject","actionId":"action","frame":0,"bounds":{"x":0.2,"y":0.2,"width":0.6,"height":0.6},"state":"specific object shape/state at this frame","transition":"transform | move | reveal | hold"}]
}
Copy every settings value from ACTIVE EXECUTION CONTEXT exactly. Plan against actual FPS and durationInFrames: integer frame intervals are [startFrame, endFrame), 0 <= start < end <= durationInFrames. No assumed 300-frame or ten-second timeline. Runtime scale, offsets, glow and speed are controls, not effects to bake in twice.
Keep stable, unique object/action/shot IDs (letters, digits, underscore, hyphen; start with a letter). References must resolve. Actions describe how those same objects change; do not replace unrelated illustrations to imply a transformation. Shots may be [] for a continuous composition; when present, list them chronologically and reference actions that overlap their intervals. Transitions track the relevant existing object IDs.
KEY-POSE CONTRACT: Include keyPoses for the focal subjects/actions that need measurable staging; use a few meaningful poses, not sampled animation frames or coordinates for every decoration. Each pose references a declared object participating in its action. List poses chronologically per object, with no duplicate object/frame. Pose frames are integers within the referenced action's inclusive start/end boundaries and 0..durationInFrames; a pose at durationInFrames is a terminal interpolation target, not an extra rendered frame.
Bounds describe the visible object's canvas-relative top-left x/y and width/height in 0..1, with x+width and y+height <= 1. They are visible bounds, not a restriction on off-canvas geometry or overshoot; zero extent can represent an initially hidden object. Choose proportions from the subject's role, action and requested composition; do not make the focal subject incidental to its scenery. No compulsory size or position. Account for canvas aspect ratio. Runtime scale/offsets remain separate controls.
State describes recognizable construction at that pose. Transition describes how the SAME object arrives from its preceding pose: transform for state/geometry change, move for position change without changing construction, reveal for intentional visibility change, hold ONLY for unchanged state, bounds and anchors. This is the INCOMING transition, not a label for what happens after the pose: a final transformed pose uses transform even if a static hold follows. Match transition semantics to the actual poses and action fromState/toState. Describe intermediate folding, bending, joining or information changes in action.change/motion when required; fading/scaling a completed illustration is not a substitute for a requested structural transformation. Reveals are legitimate for typography, logos, icons and abstract work. Explain hold purpose in action.change/motion; allocate time according to communication/reading needs, not filler or compulsory continuous movement. A static plan may use one hold pose; keyPoses may be [] when no measurable subject poses are useful.
The core actions, objects and composition must describe a complete implementable plan without relying on optional pose metadata; never delegate essential construction or motion to a pose table. For physically connected objects only, add optional anchors:[{"id":"joint","x":0.5,"y":0.5}] and attachments:[{"anchor":"joint","objectId":"other","targetAnchor":"joint"}]. Anchor coordinates use the SAME normalized canvas space, not object-local units. Declare anchors on both objects' poses at matching connection frames; attached anchor coordinates must coincide. Keep named anchors through connected motion and explain how objects carry, attach to or unfold from one another. Do not use unrelated replacements or inconsistent geometry for continuous assembly. Omit anchors/attachments for styles that do not need physical connections. Maximum 64 poses, 8 anchors and 8 attachments per pose; all existing JSON/description limits still apply.
Typography, logos, infographics, product demonstrations and narratives need different plans. Choose composition from the subject and action; do not default to persistent left text/right artwork. Simple requests should stay intentionally simple. No fixed scene count, camera, particles, 3D, effects or visual density. Avoid vague adjectives in place of construction and action descriptions.
Honor explicit no-text instructions with mode "none" and items []; no labels, title, badge, glyphs or incidental lettering. Otherwise preserve requested wording; add minimal explanatory text only when it helps the stated intent. Every visible text item references an object. Explicit reusable text supplied below is an intentional user choice; include its nonempty values verbatim. Never invent claims or statistics.
Maximum 24 objects, 48 actions, 12 optional shots and 24 text items. Descriptions <= 800 characters each; total JSON <= 24000 characters. These are size limits, not desired density. Use [] for unnecessary details/relationships. Reconcile geometry, continuity, timing and user constraints before returning JSON.`

// Detect unambiguous standalone directives only; the Director also interprets the full brief.
export function requestsNoText(prompt: string): boolean {
  return /\b(?:no (?:visible |on-screen )?text|without (?:any )?text|text[- ]free|tanpa teks)(?=\s*(?:[.!?,;:\n]|$))/i.test(prompt)
}

export interface BlueprintPoseDiagnostic {
  outcome: 'normalized' | 'optional-fallback'
  reason: string
  objectCount: number
}

export function parseCreativeBlueprint(raw: string, settings: Settings, noText: boolean,
  reusedText?: GenerateVideoPayload['qualityText'],
  onPoseDiagnostic?: (diagnostic: BlueprintPoseDiagnostic) => void): CreativeBlueprint {
  const invalid = (field: string): never => { throw new Error(`Invalid Visual Blueprint: ${field}.`) }
  if (raw.length > 24000) invalid('size limit exceeded')
  let data: unknown
  try { data = JSON.parse(raw) } catch { invalid('expected JSON') }
  const record = (value: unknown, keys: string[], field: string, optional: string[] = []): Record<string, unknown> => {
    if (!value || typeof value !== 'object' || Array.isArray(value) ||
      Object.keys(value).some(key => !keys.includes(key) && !optional.includes(key)) ||
      keys.some(key => !Object.hasOwn(value, key))) invalid(field)
    return value as Record<string, unknown>
  }
  const string = (value: unknown, field: string): string => {
    if (typeof value !== 'string' || !value.trim() || value.length > 800) invalid(field)
    return value as string
  }
  const list = (value: unknown, min: number, max: number, field: string): unknown[] => {
    if (!Array.isArray(value) || value.length < min || value.length > max) invalid(field)
    return value as unknown[]
  }
  const ids = new Set<string>()
  const id = (value: unknown, field: string): string => {
    const result = string(value, field)
    if (!/^[A-Za-z][A-Za-z0-9_-]{0,39}$/.test(result) || ids.has(result)) invalid(field)
    ids.add(result)
    return result
  }
  const range = (value: Record<string, unknown>, field: string): void => {
    if (!Number.isInteger(value.startFrame) || !Number.isInteger(value.endFrame) ||
      (value.startFrame as number) < 0 || (value.endFrame as number) > settings.durationInFrames ||
      (value.startFrame as number) >= (value.endFrame as number)) invalid(field)
  }
  const root = record(data, ['version', 'intent', 'style', 'settings', 'objects', 'actions', 'shots', 'composition', 'text'], 'structure', ['keyPoses'])
  if (root.version !== 1) invalid('version')
  string(root.intent, 'intent'); string(root.style, 'style')
  const context = record(root.settings, Object.keys(settings), 'settings')
  for (const key of Object.keys(settings)) if (context[key] !== settings[key as keyof Settings]) invalid('settings mismatch')
  const objects = list(root.objects, 1, 24, 'objects').map(value => {
    const object = record(value, ['id', 'subject', 'appearance', 'position', 'details', 'relationships'], 'object')
    id(object.id, 'object ID')
    for (const key of ['subject', 'appearance', 'position']) string(object[key], `object ${key}`)
    list(object.details, 0, 12, 'details').forEach(value => string(value, 'detail'))
    return object
  })
  const objectIds = new Set(objects.map(object => object.id))
  const references = (value: unknown, allowed: Set<unknown>, min: number, field: string): void => {
    const refs = list(value, min, 24, field)
    if (new Set(refs).size !== refs.length || refs.some(ref => !allowed.has(ref))) invalid(field)
  }
  for (const object of objects) {
    for (const value of list(object.relationships, 0, 24, 'relationships')) {
      const relation = record(value, ['objectId', 'relationship'], 'relationship')
      if (!objectIds.has(relation.objectId) || relation.objectId === object.id) invalid('relationship reference')
      string(relation.relationship, 'relationship description')
    }
  }
  const actions = list(root.actions, 1, 48, 'actions').map(value => {
    const action = record(value, ['id', 'objectIds', 'startFrame', 'endFrame', 'fromState', 'change', 'toState', 'motion'], 'action')
    id(action.id, 'action ID'); range(action, 'action timing')
    references(action.objectIds, objectIds, 1, 'action object references')
    for (const key of ['fromState', 'change', 'toState', 'motion']) string(action[key], `action ${key}`)
    return action
  })
  const actionIds = new Set(actions.map(action => action.id))
  let previousStart = -1
  for (const value of list(root.shots, 0, 12, 'shots')) {
    const shot = record(value, ['id', 'startFrame', 'endFrame', 'objective', 'actionIds', 'transition'], 'shot')
    id(shot.id, 'shot ID'); range(shot, 'shot timing'); string(shot.objective, 'shot objective')
    if ((shot.startFrame as number) < previousStart) invalid('shot order')
    previousStart = shot.startFrame as number
    references(shot.actionIds, actionIds, 1, 'shot action references')
    for (const actionId of shot.actionIds as string[]) {
      const action = actions.find(item => item.id === actionId)!
      if ((action.startFrame as number) >= (shot.endFrame as number) ||
        (action.endFrame as number) <= (shot.startFrame as number)) invalid('shot/action timing mismatch')
    }
    const transition = record(shot.transition, ['objectIds', 'description'], 'transition')
    references(transition.objectIds, objectIds, 0, 'transition references')
    string(transition.description, 'transition description')
  }
  const composition = record(root.composition, ['hierarchy', 'framing', 'collisionAvoidance'], 'composition')
  for (const key of Object.keys(composition)) string(composition[key], `composition ${key}`)
  const text = record(root.text, ['mode', 'items'], 'text')
  if (!['none', 'requested', 'minimal'].includes(text.mode as string) || (noText && text.mode !== 'none')) invalid('text policy')
  const items = list(text.items, 0, 24, 'text items').map(value => {
    const item = record(value, ['objectId', 'content'], 'text item')
    if (!objectIds.has(item.objectId)) invalid('text object reference')
    return string(item.content, 'text content')
  })
  if ((text.mode === 'none' && items.length) || (text.mode !== 'none' && !items.length)) invalid('text policy')
  for (const value of Object.values(reusedText ?? {})) {
    if (value && !items.includes(value)) invalid('explicit reusable text missing')
  }
  // Validate the entire essential plan before considering optional pose recovery.
  if (Object.hasOwn(root, 'keyPoses')) {
    const validatePoses = (input: unknown): BlueprintKeyPose[] => {
      const unit = (value: unknown, field: string): number => {
        if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 1) invalid(field)
        return value as number
      }
      const poses = list(input, 0, 64, 'key poses').map(value => {
        const pose = record(value, ['objectId', 'actionId', 'frame', 'bounds', 'state', 'transition'], 'key pose', ['anchors', 'attachments'])
        const action = actions.find(item => item.id === pose.actionId)
        if (!objectIds.has(pose.objectId) || !action || !(action.objectIds as unknown[]).includes(pose.objectId)) invalid('key pose object/action reference')
        if (!Number.isInteger(pose.frame) || (pose.frame as number) < (action!.startFrame as number) ||
          (pose.frame as number) > (action!.endFrame as number)) invalid('key pose frame outside action')
        const bounds = record(pose.bounds, ['x', 'y', 'width', 'height'], 'key pose bounds')
        for (const key of Object.keys(bounds)) unit(bounds[key], `key pose bounds ${key}`)
        if ((bounds.x as number) + (bounds.width as number) > 1 + 1e-9 ||
          (bounds.y as number) + (bounds.height as number) > 1 + 1e-9) invalid('key pose visible bounds exceed canvas')
        string(pose.state, 'key pose state')
        if (!['transform', 'move', 'reveal', 'hold'].includes(pose.transition as string)) invalid('key pose transition')
        const anchorIds = new Set<string>()
        if (Object.hasOwn(pose, 'anchors')) for (const value of list(pose.anchors, 0, 8, 'key pose anchors')) {
          const anchor = record(value, ['id', 'x', 'y'], 'key pose anchor')
          const name = string(anchor.id, 'key pose anchor ID')
          if (!/^[A-Za-z][A-Za-z0-9_-]{0,39}$/.test(name) || anchorIds.has(name)) invalid('key pose duplicate/invalid anchor ID')
          anchorIds.add(name)
          unit(anchor.x, 'key pose anchor x'); unit(anchor.y, 'key pose anchor y')
        }
        const attachments = new Set<string>()
        if (Object.hasOwn(pose, 'attachments')) for (const value of list(pose.attachments, 0, 8, 'key pose attachments')) {
          const attachment = record(value, ['anchor', 'objectId', 'targetAnchor'], 'key pose attachment')
          if (!anchorIds.has(attachment.anchor as string) || !objectIds.has(attachment.objectId) ||
            attachment.objectId === pose.objectId) invalid('key pose attachment reference')
          string(attachment.targetAnchor, 'key pose target anchor')
          const connection = JSON.stringify([attachment.anchor, attachment.objectId, attachment.targetAnchor])
          if (attachments.has(connection)) invalid('key pose duplicate attachment')
          attachments.add(connection)
        }
        return pose as unknown as BlueprintKeyPose
      })
      const previous = new Map<string, BlueprintKeyPose>()
      for (const pose of poses) {
        const prior = previous.get(pose.objectId)
        if (prior && pose.frame <= prior.frame) invalid('key pose order/duplicate object frame')
        if (prior) {
          const sameBounds = Object.keys(pose.bounds).every(key =>
            pose.bounds[key as keyof typeof pose.bounds] === prior.bounds[key as keyof typeof prior.bounds])
          const sameAnchors = (dx = 0, dy = 0): boolean =>
            (pose.anchors ?? []).length === (prior.anchors ?? []).length &&
            (pose.anchors ?? []).every(anchor => prior.anchors?.some(item => item.id === anchor.id &&
              Math.abs(anchor.x - item.x - dx) <= 1e-9 && Math.abs(anchor.y - item.y - dy) <= 1e-9))
          const connections = (item: BlueprintKeyPose): string => JSON.stringify((item.attachments ?? [])
            .map(value => JSON.stringify([value.anchor, value.objectId, value.targetAnchor])).sort())
          const sameConnections = connections(pose) === connections(prior)
          const translation = pose.state === prior.state && pose.bounds.width === prior.bounds.width &&
            pose.bounds.height === prior.bounds.height && sameConnections &&
            sameAnchors(pose.bounds.x - prior.bounds.x, pose.bounds.y - prior.bounds.y)
          if (pose.transition === 'move' && !translation) invalid('key pose move changes state/geometry')
          if (pose.transition === 'hold' &&
            (pose.state !== prior.state || !sameBounds || !sameAnchors() || !sameConnections)) {
            const action = actions.find(item => item.id === pose.actionId)!
            // Only exact action endpoint evidence supports reclassification; never guess missing geometry.
            const endpoints = prior.actionId === pose.actionId && prior.frame === action.startFrame &&
              pose.frame === action.endFrame && prior.state === action.fromState && pose.state === action.toState
            const visibilityAction = /\b(fade|opacity|visibility|reveal)\b/i.test(String(action.change) + ' ' + String(action.motion))
            if (endpoints && action.fromState !== action.toState && sameConnections && !visibilityAction) {
              pose.transition = 'transform'
            } else if (endpoints && translation && !sameBounds &&
              /\b(move|translate|travel|shift|reposition)\b/i.test(String(action.change) + ' ' + String(action.motion))) {
              pose.transition = 'move'
            } else invalid('key pose hold changes state/geometry')
          }
        }
        previous.set(pose.objectId, pose)
        for (const attachment of pose.attachments ?? []) {
          const source = pose.anchors!.find(anchor => anchor.id === attachment.anchor)!
          const target = poses.find(item => item.objectId === attachment.objectId && item.frame === pose.frame)
            ?.anchors?.find(anchor => anchor.id === attachment.targetAnchor)
          if (!target) invalid('key pose attachment needs matching target pose/anchor')
          if (Math.abs(source.x - target!.x) > 1e-6 || Math.abs(source.y - target!.y) > 1e-6) invalid('key pose attached anchors disagree')
        }
      }
      return poses
    }

    const rawPoses = list(root.keyPoses, 0, 64, 'key poses')
    // Reference errors remain fatal: do not reinterpret an unknown subject or action.
    for (const value of rawPoses) {
      const pose = record(value, ['objectId', 'actionId'], 'key pose references', ['frame', 'bounds', 'state', 'transition', 'anchors', 'attachments'])
      const action = actions.find(item => item.id === pose.actionId)
      if (!objectIds.has(pose.objectId) || !action || !(action.objectIds as unknown[]).includes(pose.objectId)) invalid('key pose object/action reference')
      for (const value of list(pose.attachments ?? [], 0, 8, 'key pose attachments')) {
        const attachment = record(value, ['anchor', 'objectId', 'targetAnchor'], 'key pose attachment')
        if (!objectIds.has(attachment.objectId) || attachment.objectId === pose.objectId) invalid('key pose attachment reference')
      }
    }
    // Connected tracks are an atomic unit, so fallback cannot leave dangling attachment guidance.
    const groups = new Map<unknown, Set<unknown>>()
    for (const objectId of objectIds) groups.set(objectId, new Set([objectId]))
    for (const value of rawPoses) {
      const pose = value as BlueprintKeyPose
      for (const attachment of pose.attachments ?? []) {
        const merged = new Set([...groups.get(pose.objectId)!, ...groups.get(attachment.objectId)!])
        for (const member of merged) groups.set(member, merged)
      }
    }
    const core = { ...root }; delete core.keyPoses
    // Explicit dependence on the optional section makes discarding it unsafe.
    const dependsOnPoses = /\b(?:key[- ]?poses|(?:pose|anchor|attachment) (?:table|metadata|coordinates))\b/i.test(JSON.stringify(core))
    const accepted: BlueprintKeyPose[] = []
    for (const group of new Set(groups.values())) {
      const track = rawPoses.filter(value => group.has((value as BlueprintKeyPose).objectId))
      if (!track.length) continue
      const before = track.map(value => (value as BlueprintKeyPose).transition)
      // Validate a copy: failed normalization must not mutate retained guidance or the core.
      let validated: BlueprintKeyPose[]
      try { validated = validatePoses(JSON.parse(JSON.stringify(track))) } catch (error) {
        if (dependsOnPoses) invalid('optional key poses inconsistent but required by core plan')
        if (!(error instanceof Error) || !error.message.startsWith('Invalid Visual Blueprint: ')) throw error
        const reason = error.message
        onPoseDiagnostic?.({ outcome: 'optional-fallback', reason, objectCount: group.size })
        continue
      }
      accepted.push(...validated)
      if (validated.some((pose, index) => pose.transition !== before[index])) {
        onPoseDiagnostic?.({ outcome: 'normalized', reason: 'Incoming hold reclassified from exact core action endpoints', objectCount: group.size })
      }
    }
    // Preserve original interleaving and all unchanged valid guidance.
    root.keyPoses = rawPoses.flatMap(value => {
      const pose = value as BlueprintKeyPose
      const retained = accepted.find(item => item.objectId === pose.objectId && item.frame === pose.frame)
      return retained ? [retained] : []
    })
  }
  return data as CreativeBlueprint
}
