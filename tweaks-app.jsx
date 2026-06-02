/* Innovate-learning — Tweaks panel app.
   Mounts only the floating panel; all values flow through window.IL
   (localStorage + CSS vars) so they persist and apply live. */
const IL_TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "headlineFont": "Schibsted Grotesk",
  "radius": 22,
  "tone": "warm",
  "accent": "#2f9e6b"
}/*EDITMODE-END*/;

function TweaksApp() {
  const init = (window.IL && IL.getTweaks) ? IL.getTweaks() : IL_TWEAK_DEFAULTS;
  const [t, setTweak] = useTweaks(init);

  React.useEffect(() => {
    if (window.IL && IL.saveTweaks) IL.saveTweaks(t);
  }, [t]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Brand accent" />
      <TweakColor
        label="Accent"
        value={t.accent}
        options={["#2f9e6b", "#1f9aa8", "#5566e6", "#c8633e"]}
        onChange={(v) => setTweak("accent", v)}
      />
      <TweakSection label="Typography" />
      <TweakRadio
        label="Headline"
        value={t.headlineFont}
        options={[
          { value: "Schibsted Grotesk", label: "Schibsted" },
          { value: "Bricolage Grotesque", label: "Bricolage" },
          { value: "Space Grotesk", label: "Space" }
        ]}
        onChange={(v) => setTweak("headlineFont", v)}
      />
      <TweakSection label="Surface" />
      <TweakRadio
        label="Paper tone"
        value={t.tone}
        options={[
          { value: "warm", label: "Warm" },
          { value: "neutral", label: "Neutral" },
          { value: "cool", label: "Cool" }
        ]}
        onChange={(v) => setTweak("tone", v)}
      />
      <TweakSlider
        label="Corner radius"
        value={t.radius}
        min={6}
        max={30}
        step={1}
        unit="px"
        onChange={(v) => setTweak("radius", v)}
      />
    </TweaksPanel>
  );
}

(function mount() {
  const el = document.getElementById("tweaks-root");
  if (el) ReactDOM.createRoot(el).render(<TweaksApp />);
})();
