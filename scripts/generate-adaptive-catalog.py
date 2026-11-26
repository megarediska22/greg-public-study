"""Export the approved planning tables as a deterministic, deployable catalogue."""
import csv
import json
import sys
from pathlib import Path

root = Path(__file__).resolve().parents[1]
source = root / 'research/curriculum-assessment'

def rows(path):
    with (source / path).open(encoding='utf-8', newline='') as file:
        return list(csv.DictReader(file))

def ids(value):
    return value.split(' | ') if value else []

groups = [dict(id=r['knowledge_id'], scope=r['scope'], name=r['name'],
               placementCriterion=r['placement_criterion_id'] or None,
               objectives=ids(r['objective_ids']), lessons=ids(r['lesson_ids']),
               review=r['review_lesson_id'] or None,
               required=ids(r['required_knowledge_ids']), methods=r['methods'],
               criterion=r['criterion'], limits=r['confidence_limits'])
          for r in rows('assessment/KNOWLEDGE_MODEL.csv')]
sequence = [dict(id=r['lesson_id'], route=r['route'], objectives=ids(r['objective_ids']),
                 required=ids(r['required_knowledge']), recommended=ids(r['recommended_knowledge']))
            for r in rows('blueprint/LESSON_SEQUENCE.csv')]
objectives = [dict(id=r['objective_id'], name=r['objective'], lessons=ids(r['target_lesson_ids']))
              for r in rows('blueprint/TARGET_COVERAGE_MATRIX.csv')]
edges = [dict(lesson=r['target_lesson_id'], objective=r['target_objective_id'],
              prerequisiteLesson=r['prerequisite_lesson_id'], prerequisite=r['prerequisite_objective_id'],
              relation=r['relation'])
         for r in rows('blueprint/TARGET_PREREQUISITES.csv') if r['prerequisite_objective_id']]
checkpoints = [dict(id=r['checkpoint_id'], lesson=r['lesson_id'], mode=r['mode'],
                    objectives=ids(r['objective_ids']), groups=ids(r['knowledge_ids']),
                    readiness=ids(r['readiness_knowledge_ids']), next=r['next_lesson_id'] or None)
               for r in rows('assessment/CHECKPOINT_SPEC.csv')]
data = dict(groups=groups, sequence=sequence, objectives=objectives, edges=edges, checkpoints=checkpoints)
output = root / 'src/lib/adaptive/catalog.generated.json'
encoded = json.dumps(data, ensure_ascii=False, separators=(',', ':')) + '\n'
if '--check' in sys.argv:
    assert output.read_text(encoding='utf-8') == encoded, 'Regenerate the adaptive catalogue from the approved tables.'
else:
    output.write_text(encoded, encoding='utf-8')
print(f'{len(groups)} groups, {len(objectives)} objectives, {len(sequence)} planned sequence entries, {len(checkpoints)} checkpoints')
