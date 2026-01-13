import { Download, Play, Settings } from 'lucide-react';

const SettingsCard = ({
  nftCount,
  onNftCountChange,
  onGenerate,
  generating,
  layersCount,
  generatedCount,
  onDownloadAll,
  generationProgress,
  progressPercent,
}) => {
  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 border border-white border-opacity-20">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="text-blue-300" size={24} />
        <h2 className="text-2xl font-bold text-white">Settings</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-white block mb-2">Number of NFTs</label>
          <input
            type="number"
            value={nftCount}
            onChange={onNftCountChange}
            className="w-full bg-white bg-opacity-20 text-white px-4 py-2 rounded border border-white border-opacity-30"
            min="1"
            max="10000"
          />
        </div>

        <button
          onClick={onGenerate}
          disabled={generating || layersCount === 0}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-all"
        >
          <Play size={20} />
          {generating ? 'Generating...' : 'Generate NFTs'}
        </button>

        {generating && (
          <div className="rounded-lg border border-white border-opacity-10 bg-white bg-opacity-5 p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-200">Generating NFTs</span>
              <span className="text-white font-semibold">
                {generationProgress.generated}/{generationProgress.total}
              </span>
            </div>
            <div className="mt-2 h-2 bg-white bg-opacity-10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {generatedCount > 0 && (
          <button
            onClick={onDownloadAll}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-all"
          >
            <Download size={20} />
            Download All
          </button>
        )}
      </div>
    </div>
  );
};

export default SettingsCard;
