import { Fingerprint } from 'lucide-react';

const UniquenessCard = ({
  layers,
  uniquenessStats,
  diversityPercent,
  similarityLabel,
  similarityColor,
  uniquenessBarClass,
  requestedExceedsPossible,
  formatCompactNumber,
}) => {
  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 border border-white border-opacity-20">
      <div className="flex items-center gap-2 mb-4">
        <Fingerprint className="text-blue-300" size={24} />
        <h2 className="text-2xl font-bold text-white">Uniqueness</h2>
      </div>

      <div className="space-y-4">
        {layers.length === 0 && (
          <p className="text-blue-200 text-sm">
            Upload layers to see possible combinations and diversity.
          </p>
        )}

        {layers.length > 0 && (
          <div className="bg-white bg-opacity-5 border border-white border-opacity-10 rounded-lg p-3">
            <p className="text-xs uppercase tracking-wide text-blue-200">
              Possible combinations
            </p>
            <p className="text-white text-lg font-semibold mt-1">
              {formatCompactNumber(uniquenessStats?.possibleCombinations)}
            </p>
            {requestedExceedsPossible && (
              <p className="text-rose-200 text-xs mt-2">
                Requested count exceeds possible combinations. Expect duplicates or very similar
                NFTs.
              </p>
            )}
          </div>
        )}

        {diversityPercent === null && layers.length > 0 && (
          <p className="text-blue-200 text-sm">
            Generate NFTs to calculate diversity and trait coverage.
          </p>
        )}

        {diversityPercent !== null && (
          <div className="bg-white bg-opacity-5 border border-white border-opacity-10 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wide text-blue-200">Diversity score</p>
              <p className="text-white font-semibold">{diversityPercent}%</p>
            </div>
            <div className="mt-3 h-2 bg-white bg-opacity-10 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${uniquenessBarClass}`}
                style={{ width: `${diversityPercent}%` }}
              />
            </div>
            <p className="text-xs mt-3 text-blue-200">
              Similarity risk:{' '}
              <span className={`font-semibold ${similarityColor}`}>{similarityLabel}</span>
            </p>
          </div>
        )}

        {uniquenessStats?.coverage?.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-wide text-blue-200">
              Trait coverage by layer
            </p>
            {uniquenessStats.coverage.map((layer) => (
              <div
                key={layer.name}
                className="bg-white bg-opacity-5 border border-white border-opacity-10 rounded-lg p-3"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white font-semibold">{layer.name}</span>
                  <span className="text-blue-200">
                    {layer.usedTraits}/{layer.totalTraits} traits
                  </span>
                </div>
                <div className="mt-2 h-2 bg-white bg-opacity-10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
                    style={{ width: `${Math.round(layer.coverageRatio * 100)}%` }}
                  />
                </div>
                {layer.topTrait && (
                  <p className="text-xs text-blue-200 mt-2">
                    Most common: {layer.topTrait} ({Math.round(layer.topShare * 100)}%)
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UniquenessCard;
