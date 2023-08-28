export interface CodePath {
  id: string;
  initialSegment: CodePathSegment;
  finalSegments: CodePathSegment[];
  returnedSegments: CodePathSegment[];
  thrownSegments: CodePathSegment[];
  currentSegments: CodePathSegment[];
  upper: CodePath | null;
  childCodePaths: CodePath[];
}

export interface CodePathSegment {
  id: string;
  nextSegments: CodePathSegment[];
  prevSegments: CodePathSegment[];
  reachable: boolean;
}
