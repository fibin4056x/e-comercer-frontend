import { useEffect, useMemo, useState } from "react";
import { getAssetCandidates } from "../services/apiClient";

export default function SmartImage({
  assetPath,
  src,
  fallbackSrc = "/placeholder.png",
  onError,
  ...props
}) {
  const candidates = useMemo(() => {
    if (assetPath) {
      return getAssetCandidates(assetPath, fallbackSrc);
    }

    if (src) {
      return [...new Set([src, fallbackSrc].filter(Boolean))];
    }

    return [fallbackSrc];
  }, [assetPath, fallbackSrc, src]);

  const [candidateIndex, setCandidateIndex] = useState(0);

  useEffect(() => {
    setCandidateIndex(0);
  }, [candidates]);

  const resolvedSrc = candidates[Math.min(candidateIndex, candidates.length - 1)];

  return (
    <img
      {...props}
      src={resolvedSrc}
      onError={(event) => {
        setCandidateIndex((currentIndex) =>
          currentIndex < candidates.length - 1 ? currentIndex + 1 : currentIndex
        );

        if (typeof onError === "function") {
          onError(event);
        }
      }}
    />
  );
}
