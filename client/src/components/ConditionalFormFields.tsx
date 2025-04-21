export type FighterProps = {
  weight: number;
  height: string;
  record: string;
  gymName?: string;
  pullouts: number;
  weightMisses: number;
  finishes: number;
};

export type PromoterProps = {
  promotion: number;
  promoter: number;
  nextEvent?: string;
};

type UserProps = {
  userType: 'fighter' | 'promoter';
  fighterFormData: FighterProps;
  promoterFormData: PromoterProps;
  onChange: (name: string, value: string) => void;
};

export function ConditionalFormFields({
  userType,
  fighterFormData,
  promoterFormData,
  onChange,
}: UserProps) {
  return (
    <div>
      <h3>{userType === 'fighter' ? 'Fighter' : 'Promoter'} Account</h3>
      {userType === 'fighter' ? (
        <>
          <label>
            Weight
            <input
              required
              type="number"
              name="weight"
              value={fighterFormData.weight}
              onChange={(e) => onChange('weight', e.target.value)}
              className="block border border-gray-600 rounded p-2 h-8 w-full mb-2"
            />
          </label>
          <label>
            Height
            <input
              required
              type="text"
              className="block border border-gray-600 rounded p-2 h-8 w-full mb-2"
              name="height"
              value={fighterFormData.height}
              onChange={(e) => onChange('height', e.target.value)}
            />
          </label>
          <label>
            Record
            <input
              required
              type="text"
              name="record"
              className="block border border-gray-600 rounded p-2 h-8 w-full mb-2"
              value={fighterFormData.record}
              onChange={(e) => onChange('record', e.target.value)}
            />
          </label>
          <label>
            Gym Name
            <input
              required
              type="text"
              name="gymName"
              className="block border border-gray-600 rounded p-2 h-8 w-full mb-2"
              value={fighterFormData.gymName}
              onChange={(e) => onChange('gymName', e.target.value)}
            />
          </label>
          <label>
            Pullouts
            <input
              required
              type="number"
              name="pullouts"
              className="block border border-gray-600 rounded p-2 h-8 w-full mb-2"
              value={fighterFormData.pullouts}
              onChange={(e) => onChange('pullouts', e.target.value)}
            />
          </label>
          <label>
            Weight Misses
            <input
              required
              type="number"
              name="weightMisses"
              className="block border border-gray-600 rounded p-2 h-8 w-full mb-2"
              value={fighterFormData.weightMisses}
              onChange={(e) => onChange('weightMisses', e.target.value)}
            />
          </label>
          <label>
            Finishes
            <input
              required
              type="number"
              className="block border border-gray-600 rounded p-2 h-8 w-full mb-2"
              name="finishes"
              value={fighterFormData.finishes}
              onChange={(e) => onChange('finishes', e.target.value)}
            />
          </label>
        </>
      ) : (
        <>
          <label>
            Promotion
            <input
              required
              type="text"
              className="block border border-gray-600 rounded p-2 h-8 w-full mb-2"
              name="promotion"
              value={promoterFormData.promotion}
              onChange={(e) => onChange('promotion', e.target.value)}
            />
          </label>
          <label>
            Promoter
            <input
              required
              type="text"
              className="block border border-gray-600 rounded p-2 h-8 w-full mb-2"
              name="promoter"
              value={promoterFormData.promoter}
              onChange={(e) => onChange('promoter', e.target.value)}
            />
          </label>
          <label>
            Next Event
            <input
              type="date"
              name="nextEvent"
              className="block border border-gray-600 rounded p-2 h-8 w-full mb-2"
              value={promoterFormData.nextEvent}
              onChange={(e) => onChange('nextEvent', e.target.value)}
            />
          </label>
        </>
      )}
    </div>
  );
}
