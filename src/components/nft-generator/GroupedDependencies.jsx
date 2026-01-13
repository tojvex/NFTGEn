import { useRef } from 'react';
import { Link2, Plus, Trash2 } from 'lucide-react';

const GroupedDependencies = ({
  groupRules,
  layers,
  onAddGroupRule,
  onRemoveGroupRule,
  onUpdateGroupRule,
  onToggleTrait,
  onSetTraits,
  onImportRules,
  onExportRules,
  exportDisabled,
  expanded,
  onToggle,
}) => {
  const rulesInputRef = useRef(null);

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 border border-white border-opacity-20">
      <div
        className={`flex items-center justify-between ${expanded ? 'mb-4' : ''}`}
      >
        <div className="flex items-center gap-2">
          <Link2 className="text-blue-300" size={24} />
          <h2 className="text-2xl font-bold text-white">Grouped Dependencies</h2>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="px-3 py-1 rounded bg-white bg-opacity-10 hover:bg-opacity-20 text-white text-sm transition-all"
        >
          {expanded ? 'Hide' : 'Show'}
        </button>
      </div>

      {expanded && (
        <>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <input
              ref={rulesInputRef}
              type="file"
              accept="application/json"
              onChange={onImportRules}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => rulesInputRef.current?.click()}
              className="bg-white bg-opacity-10 hover:bg-opacity-20 text-white px-4 py-2 rounded-lg transition-all"
            >
              Import JSON
            </button>
            <button
              type="button"
              onClick={onExportRules}
              disabled={exportDisabled}
              className="bg-white bg-opacity-10 hover:bg-opacity-20 disabled:opacity-40 text-white px-4 py-2 rounded-lg transition-all"
            >
              Export JSON
            </button>
            <button
              onClick={onAddGroupRule}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
            >
              <Plus size={20} />
              Add Group Rule
            </button>
          </div>

          <p className="text-blue-200 text-sm mb-4">
            Example: If Body is X/Y/Z, then Head must be A/B/C. Pick multiple traits on each side to
            avoid dozens of pair rules. Import replaces current rules.
          </p>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
        {groupRules.map((rule) => {
          const sourceTraits =
            layers.find((layer) => layer.name === rule.sourceLayer)?.traits || [];
          const targetTraits =
            layers.find((layer) => layer.name === rule.targetLayer)?.traits || [];
          const mode = rule.mode === 'exclude' ? 'exclude' : 'require';
          const ruleSummary =
            mode === 'exclude'
              ? 'Rule: if any selected trait appears in the left layer, the right layer cannot be any selected traits.'
              : 'Rule: if any selected trait appears in the left layer, the right layer must be one of its selected traits.';
          return (
            <div key={rule.id} className="bg-white bg-opacity-10 p-4 rounded-lg space-y-3">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-blue-200">If layer</label>
                        <span className="text-xs text-blue-200">
                          {rule.sourceTraits.length} selected
                        </span>
                      </div>
                      <select
                        value={rule.sourceLayer}
                        onChange={(event) =>
                          onUpdateGroupRule(rule.id, 'sourceLayer', event.target.value)
                        }
                        className="w-full bg-gray-800 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-400 focus:outline-none"
                        style={{ colorScheme: 'dark' }}
                      >
                        <option value="">Select Layer</option>
                        {layers.map((layer) => (
                          <option key={layer.name} value={layer.name}>
                            {layer.name}
                          </option>
                        ))}
                      </select>
                      <div className="flex items-center justify-between text-xs text-blue-200">
                        <span>Pick traits (click to toggle)</span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              onSetTraits(
                                rule.id,
                                'sourceTraits',
                                sourceTraits.map((trait) => trait.name)
                              )
                            }
                            disabled={!rule.sourceLayer || sourceTraits.length === 0}
                            className="px-2 py-1 rounded bg-white bg-opacity-10 hover:bg-opacity-20 disabled:opacity-40"
                          >
                            All
                          </button>
                          <button
                            type="button"
                            onClick={() => onSetTraits(rule.id, 'sourceTraits', [])}
                            disabled={!rule.sourceLayer || rule.sourceTraits.length === 0}
                            className="px-2 py-1 rounded bg-white bg-opacity-10 hover:bg-opacity-20 disabled:opacity-40"
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                      <div
                        className={`max-h-40 overflow-y-auto rounded border border-gray-600 p-2 space-y-2 ${
                          rule.sourceLayer ? 'bg-gray-800' : 'bg-gray-900 opacity-60'
                        }`}
                      >
                        {sourceTraits.length === 0 && (
                          <p className="text-xs text-blue-200 px-2">
                            Select a layer to see traits.
                          </p>
                        )}
                        {sourceTraits.map((trait) => {
                          const checked = rule.sourceTraits.includes(trait.name);
                          return (
                            <label
                              key={trait.name}
                              className={`flex items-center gap-2 rounded px-2 py-1 cursor-pointer transition ${
                                checked
                                  ? 'bg-blue-500 bg-opacity-20 text-white'
                                  : 'text-blue-100 hover:bg-white hover:bg-opacity-10'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => onToggleTrait(rule.id, 'sourceTraits', trait.name)}
                                disabled={!rule.sourceLayer}
                              />
                              <span className="text-sm">{trait.name}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-blue-200">Then</label>
                        <div className="flex items-center gap-2">
                          <select
                            value={mode}
                            onChange={(event) =>
                              onUpdateGroupRule(rule.id, 'mode', event.target.value)
                            }
                            className="bg-gray-800 text-white text-xs px-2 py-1 rounded border border-gray-600 focus:border-blue-400 focus:outline-none"
                            style={{ colorScheme: 'dark' }}
                          >
                            <option value="require">Require</option>
                            <option value="exclude">Exclude</option>
                          </select>
                          <span className="text-xs text-blue-200">
                            {rule.targetTraits.length} selected
                          </span>
                        </div>
                      </div>
                      <select
                        value={rule.targetLayer}
                        onChange={(event) =>
                          onUpdateGroupRule(rule.id, 'targetLayer', event.target.value)
                        }
                        className="w-full bg-gray-800 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-400 focus:outline-none"
                        style={{ colorScheme: 'dark' }}
                      >
                        <option value="">Select Layer</option>
                        {layers.map((layer) => (
                          <option key={layer.name} value={layer.name}>
                            {layer.name}
                          </option>
                        ))}
                      </select>
                      <div className="flex items-center justify-between text-xs text-blue-200">
                        <span>Pick traits (click to toggle)</span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              onSetTraits(
                                rule.id,
                                'targetTraits',
                                targetTraits.map((trait) => trait.name)
                              )
                            }
                            disabled={!rule.targetLayer || targetTraits.length === 0}
                            className="px-2 py-1 rounded bg-white bg-opacity-10 hover:bg-opacity-20 disabled:opacity-40"
                          >
                            All
                          </button>
                          <button
                            type="button"
                            onClick={() => onSetTraits(rule.id, 'targetTraits', [])}
                            disabled={!rule.targetLayer || rule.targetTraits.length === 0}
                            className="px-2 py-1 rounded bg-white bg-opacity-10 hover:bg-opacity-20 disabled:opacity-40"
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                      <div
                        className={`max-h-40 overflow-y-auto rounded border border-gray-600 p-2 space-y-2 ${
                          rule.targetLayer ? 'bg-gray-800' : 'bg-gray-900 opacity-60'
                        }`}
                      >
                        {targetTraits.length === 0 && (
                          <p className="text-xs text-blue-200 px-2">
                            Select a layer to see traits.
                          </p>
                        )}
                        {targetTraits.map((trait) => {
                          const checked = rule.targetTraits.includes(trait.name);
                          return (
                            <label
                              key={trait.name}
                              className={`flex items-center gap-2 rounded px-2 py-1 cursor-pointer transition ${
                                checked
                                  ? 'bg-blue-500 bg-opacity-20 text-white'
                                  : 'text-blue-100 hover:bg-white hover:bg-opacity-10'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => onToggleTrait(rule.id, 'targetTraits', trait.name)}
                                disabled={!rule.targetLayer}
                              />
                              <span className="text-sm">{trait.name}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-blue-200">
                    <span>{ruleSummary}</span>
                    <button
                      onClick={() => onRemoveGroupRule(rule.id)}
                      className="bg-red-500 hover:bg-red-600 text-white p-2 rounded transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default GroupedDependencies;
