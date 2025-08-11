import { useState, useEffect, useRef, useCallback } from 'react';

interface InsuranceHolder {
  id: string;
  ci: string;
  name: string;
  phone: string;
  email?: string;
  policyNumber?: string;
  policyType?: string;
  insuranceCompany?: string;
  policyStatus?: string;
  coverageType?: string;
  maxCoverageAmount?: number;
  totalPatients?: number;
  totalCases?: number;
}

interface Stats {
  totalTitulares: number;
  polizasActivas: number;
  totalPacientes: number;
  totalCasos: number;
}

interface FilterMessage {
  type: 'FILTER_DATA';
  data: InsuranceHolder[];
  searchTerm: string;
}

interface FilterResponse {
  type: 'FILTER_RESULT';
  filteredData: InsuranceHolder[];
  stats: Stats;
}

export function useFilterWorker() {
  const workerRef = useRef<Worker | null>(null);
  const [filteredData, setFilteredData] = useState<InsuranceHolder[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalTitulares: 0,
    polizasActivas: 0,
    totalPacientes: 0,
    totalCasos: 0,
  });
  const [isFiltering, setIsFiltering] = useState(false);

  useEffect(() => {
    // Create worker only on client side
    if (typeof window !== 'undefined') {
      // Create worker with inline code to avoid file path issues
      const workerCode = `
        self.onmessage = function(e) {
          const { type, data, searchTerm } = e.data;
          
          if (type === 'FILTER_DATA') {
            let filteredData;
            
            if (!searchTerm || searchTerm.trim() === '') {
              filteredData = data;
            } else {
              const searchLower = searchTerm.toLowerCase().trim();
              filteredData = data.filter((titular) => {
                return (
                  titular.name.toLowerCase().includes(searchLower) ||
                  titular.ci.toLowerCase().includes(searchLower) ||
                  titular.phone.toLowerCase().includes(searchLower) ||
                  (titular.email && titular.email.toLowerCase().includes(searchLower)) ||
                  (titular.policyNumber && titular.policyNumber.toLowerCase().includes(searchLower))
                );
              });
            }
            
            const stats = {
              totalTitulares: filteredData.length,
              polizasActivas: filteredData.filter((h) => h.policyStatus === "Activo").length,
              totalPacientes: filteredData.reduce((sum, h) => sum + (h.totalPatients || 0), 0),
              totalCasos: filteredData.reduce((sum, h) => sum + (h.totalCases || 0), 0),
            };
            
            self.postMessage({
              type: 'FILTER_RESULT',
              filteredData,
              stats
            });
          }
        };
      `;

      const blob = new Blob([workerCode], { type: 'application/javascript' });
      workerRef.current = new Worker(URL.createObjectURL(blob));

      workerRef.current.onmessage = (e: MessageEvent<FilterResponse>) => {
        const { type, filteredData, stats } = e.data;
        if (type === 'FILTER_RESULT') {
          setFilteredData(filteredData);
          setStats(stats);
          setIsFiltering(false);
        }
      };
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  const filterData = useCallback((data: InsuranceHolder[], searchTerm: string) => {
    if (workerRef.current) {
      setIsFiltering(true);
      const message: FilterMessage = {
        type: 'FILTER_DATA',
        data,
        searchTerm
      };
      workerRef.current.postMessage(message);
    } else {
      // Fallback for server-side or when worker fails
      let filtered: InsuranceHolder[];
      
      if (!searchTerm || searchTerm.trim() === '') {
        filtered = data;
      } else {
        const searchLower = searchTerm.toLowerCase().trim();
        filtered = data.filter((titular) => {
          return (
            titular.name.toLowerCase().includes(searchLower) ||
            titular.ci.toLowerCase().includes(searchLower) ||
            titular.phone.toLowerCase().includes(searchLower) ||
            (titular.email && titular.email.toLowerCase().includes(searchLower)) ||
            (titular.policyNumber && titular.policyNumber.toLowerCase().includes(searchLower))
          );
        });
      }
      
      const calculatedStats = {
        totalTitulares: filtered.length,
        polizasActivas: filtered.filter((h) => h.policyStatus === "Activo").length,
        totalPacientes: filtered.reduce((sum, h) => sum + (h.totalPatients || 0), 0),
        totalCasos: filtered.reduce((sum, h) => sum + (h.totalCases || 0), 0),
      };
      
      setFilteredData(filtered);
      setStats(calculatedStats);
      setIsFiltering(false);
    }
  }, []);

  return {
    filteredData,
    stats,
    filterData,
    isFiltering
  };
}